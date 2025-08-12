'use client';

import React, {useState, useEffect} from "react";
import Button from "../../../../../components/atoms/Button";
import FlexRow from "../../../../../components/atoms/FlexRow";
import FlexItem from "../../../../../components/atoms/FlexItem";
import {PencilIcon} from "../../../../../components/atoms/Icons";
import TopTitle from "../../../../../components/molecules/TopTitle";
import {ChatMessage} from "../../../../../entities/Chat";
import {queryAgent} from "../../../../../services/chatService";
import useChat from "../../../../../hooks/useChat";
import {useQueryClient} from '@tanstack/react-query';
import {v4 as uuidv4} from 'uuid';

const ChatPageComponent = ({conversationId}: { conversationId: string }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {conversation, isLoading: conversationLoading} = useChat(conversationId);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages);
    }
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const agentResponse = await queryAgent(conversationId, userMessage.content);
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        content: agentResponse,
        sender: 'assistant',
        timestamp: new Date()
      };
      setLocalMessages(prev => [...prev, aiMessage]);

      // Invalidate and refetch the conversation data
      queryClient.invalidateQueries({queryKey: ['chat', conversationId]});
      queryClient.invalidateQueries({queryKey: ['chatConversations']});
    } catch (error) {
      console.error('Error getting agent response:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopTitle>
        <div className="flex flex-row items-center overflow-visible">
          <div className="flex-grow"/>
          <div className="flex-grow items-center gap-2 overflow-hidden">
            <h1 className="text-xl text-center font-bold whitespace-nowrap truncate">
              {conversationLoading
                ? 'Loading...'
                : conversation?.title || 'New chat'
              }
            </h1>
          </div>
          <div className="flex-grow"/>
          <Button fitContent={true}>
            <PencilIcon/>
          </Button>
        </div>
      </TopTitle>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {localMessages.length === 0 && !conversationLoading && (
            <div className="text-center text-base-content/60 mt-8">
              <p>Start a new conversation!</p>
            </div>
          )}

          {conversationLoading && localMessages.length === 0 && (
            <div className="text-center text-base-content/60 mt-8">
              <p>Loading conversation...</p>
            </div>
          )}

          {localMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-base-content'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-base-200 text-base-content max-w-[80%] p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"
                       style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"
                       style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-base-300 p-4">
          <FlexRow>
            <FlexItem grow={true}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="textarea textarea-bordered w-full resize-none"
                rows={2}
                disabled={isLoading}
              />
            </FlexItem>
            <FlexItem>
              <Button
                clickAction={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                primary={true}
                fitContent={true}
              >
                Send
              </Button>
            </FlexItem>
          </FlexRow>
        </div>
      </div>
    </div>
  );
};

export default ChatPageComponent;