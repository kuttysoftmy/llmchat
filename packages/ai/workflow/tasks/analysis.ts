import { createTask } from '@repo/orchestrator';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { ChunkBuffer, generateText, getHumanizedDate, handleError } from '../utils';

export const analysisTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'analysis',
    execute: async ({ trace, events, context, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const prevSummaries = context?.get('summaries') || [];
        const nextStepId = Object.keys(events?.getState('steps') || {}).length;

        const prompt = `
          

                # Research Analysis Framework

Today is ${getHumanizedDate()}.

You are a Research Analyst tasked with thoroughly analyzing findings related to "${question}" before composing a comprehensive report. 

You gonna perform pre-writing analysis of the research findings.


## Research Materials

<research_findings>
${prevSummaries
    ?.map(
        (s, index) => `

## Finding ${index + 1}

${s}

`
    )
    .join('\n\n\n')}
</research_findings>


## Analysis Instructions
- Analyze the research findings one by one and highlight the most important information which will be used to compose a comprehensive report.
- Document your analysis in a structured format that will serve as the foundation for creating a comprehensive report.

                `;

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n\n'],
            onFlush: (chunk: string, fullText: string) => {
                events?.update('steps', current => ({
                    ...current,
                    [nextStepId]: {
                        ...(current?.[nextStepId] || {}),
                        steps: {
                            ...(current?.[nextStepId]?.steps || {}),
                            reasoning: {
                                data: fullText,
                                status: 'PENDING' as const,
                            },
                        },
                        id: nextStepId,
                        status: 'PENDING' as const,
                    },
                }));
            },
        });

        const text = await generateText({
            prompt,
            model: ModelEnum.Deepseek_R1,
            messages: messages as any,
            signal,
            onReasoning: reasoning => {
                chunkBuffer.add(reasoning);
            },
        });

        chunkBuffer.flush();

        events?.update('steps', current => ({
            ...current,

            [nextStepId]: {
                ...(current?.[nextStepId] || {}),
                steps: {
                    ...(current?.[nextStepId]?.steps || {}),
                    reasoning: {
                        ...current?.[nextStepId]?.steps?.reasoning,
                        status: 'COMPLETED' as const,
                    },
                },
                id: nextStepId,
                status: 'COMPLETED' as const,
            },
        }));

        events?.update('sources', current => {
            return [...(current || []), ...(context?.get('sources') || [])];
        });

        trace?.span({
            name: 'analysis',
            input: prompt,
            output: text,
            metadata: {
                question,
                prevSummaries,
            },
        });

        return {
            queries: [],
            analysis: text,
            stepId: nextStepId,
        };
    },
    onError: handleError,
    route: ({ result }) => 'writer',
});
