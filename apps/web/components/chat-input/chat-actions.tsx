import { ChatMode, useChatStore } from '@/libs/store/chat.store';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Kbd,
} from '@repo/ui';
import {
    IconArrowUp,
    IconCheck,
    IconChevronDown,
    IconPaperclip,
    IconPlayerStopFilled,
    IconWorld,
} from '@tabler/icons-react';
import { useState } from 'react';
import { DeepResearchIcon } from '../icons';
import { DotSpinner } from '../thread/step-status';

export const chatOptions = [
    {
        label: 'Deep Research',
        description: 'In depth research on complex topic',
        value: ChatMode.Deep,
        icon: <DeepResearchIcon />,
    },
];

export const modelOptions = [
    {
        label: 'Gemini Flash 2.0',
        value: ChatMode.GEMINI_2_FLASH,
        // webSearch: true,
        icon: undefined,
    },

    {
        label: 'GPT 4o Mini',
        value: ChatMode.GPT_4o_Mini,
        // webSearch: true,
        icon: undefined,
    },

    {
        label: 'O3 Mini',
        value: ChatMode.O3_Mini,
        // webSearch: true,
        icon: undefined,
    },

    {
        label: 'Claude 3.5 Sonnet',
        value: ChatMode.CLAUDE_3_5_SONNET,
        // webSearch: true,
        icon: undefined,
    },

    {
        label: 'Deepseek R1',
        value: ChatMode.DEEPSEEK_R1,
        // webSearch: true,
        icon: undefined,
    },

    {
        label: 'Claude 3.7 Sonnet',
        value: ChatMode.CLAUDE_3_7_SONNET,
        // webSearch: true,
        icon: undefined,
    },
];

export const AttachmentButton = () => {
    return (
        <Button
            size="icon"
            tooltip="Attachment (coming soon)"
            variant="ghost"
            className="gap-2"
            rounded="full"
            disabled
        >
            <IconPaperclip size={18} strokeWidth={2} className="text-muted-foreground" />
        </Button>
    );
};

export const ChatModeButton = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const setChatMode = useChatStore(state => state.setChatMode);
    const [isChatModeOpen, setIsChatModeOpen] = useState(false);

    return (
        <DropdownMenu open={isChatModeOpen} onOpenChange={setIsChatModeOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={isChatModeOpen ? 'secondary' : 'ghost'} size="sm" rounded="full">
                    {
                        [...chatOptions, ...modelOptions].find(option => option.value === chatMode)
                            ?.icon
                    }
                    {
                        [...chatOptions, ...modelOptions].find(option => option.value === chatMode)
                            ?.label
                    }
                    <IconChevronDown size={16} strokeWidth={2} />
                </Button>
            </DropdownMenuTrigger>
            <ChatModeOptions chatMode={chatMode} setChatMode={setChatMode} />
        </DropdownMenu>
    );
};

export const WebSearchButton = () => {
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const setUseWebSearch = useChatStore(state => state.setUseWebSearch);

    return (
        <Button
            size="icon"
            tooltip="Web Search"
            variant={useWebSearch ? 'secondary' : 'ghost'}
            className="gap-2"
            rounded="full"
            onClick={() => setUseWebSearch(!useWebSearch)}
        >
            <IconWorld size={18} strokeWidth={2} className="text-muted-foreground" />
        </Button>
    );
};

export const NewLineIndicator = () => {
    const editor = useChatStore(state => state.editor);
    const hasTextInput = !!editor?.getText();

    if (!hasTextInput) return null;

    return (
        <p className="flex flex-row items-center gap-1 text-xs text-gray-500">
            use <Kbd>Shift</Kbd> <Kbd>Enter</Kbd> for new line
        </p>
    );
};

export const GeneratingStatus = () => {
    return (
        <div className="text-muted-foreground flex flex-row items-center gap-1 px-2 text-xs">
            <DotSpinner /> Generating...
        </div>
    );
};

export const ChatModeOptions = ({
    chatMode,
    setChatMode,
}: {
    chatMode: ChatMode;
    setChatMode: (chatMode: ChatMode) => void;
}) => {
    return (
        <DropdownMenuContent align="start" side="bottom" className="w-[320px]">
            {chatOptions.map(option => (
                <DropdownMenuItem
                    key={option.label}
                    onSelect={() => {
                        setChatMode(option.value);
                    }}
                    className="h-auto"
                >
                    <div className="flex w-full flex-row items-start gap-1.5 px-1.5 py-1.5">
                        <div className="flex flex-col gap-0 pt-1">{option.icon}</div>

                        <div className="flex flex-col gap-0">
                            {<p className="m-0 text-sm font-medium">{option.label}</p>}
                            {option.description && (
                                <p className="text-muted-foreground text-xs font-light">
                                    {option.description}
                                </p>
                            )}
                        </div>
                    </div>
                </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {modelOptions.map(option => (
                <DropdownMenuItem
                    key={option.label}
                    onSelect={() => {
                        setChatMode(option.value);
                    }}
                    className="h-auto"
                >
                    <div className="flex w-full flex-row items-center gap-2.5 px-1.5 py-1.5">
                        <div className="flex flex-col gap-0">
                            {<p className="text-sm font-medium">{option.label}</p>}
                        </div>
                        <div className="flex-1" />
                        {chatMode === option.value && (
                            <IconCheck size={14} strokeWidth={2} className="text-brand" />
                        )}
                    </div>
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    );
};

export const SendStopButton = ({
    isGenerating,
    isChatPage,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: {
    isGenerating: boolean;
    isChatPage: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}) => {
    return isGenerating && !isChatPage ? (
        <Button size="icon" rounded="full" variant="default" onClick={stopGeneration}>
            <IconPlayerStopFilled size={14} strokeWidth={2} />
        </Button>
    ) : (
        <Button
            size="icon"
            rounded="full"
            variant={hasTextInput ? 'default' : 'secondary'}
            disabled={!hasTextInput || isGenerating}
            onClick={() => {
                sendMessage();
            }}
        >
            <IconArrowUp size={20} strokeWidth={2} />
        </Button>
    );
};
