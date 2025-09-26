import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chatbot from '../Chatbot';

// Mock the API call
jest.mock('../../../services/operations/chatbotAPI', () => ({
  sendMessageToBot: jest.fn(),
}));

import { sendMessageToBot } from '../../../services/operations/chatbotAPI';

describe('Chatbot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat button when closed', () => {
    render(<Chatbot />);
    expect(screen.getByTitle('Open SkillMart Study Adviser Bot')).toBeInTheDocument();
  });

  test('opens chat window when button is clicked', () => {
    render(<Chatbot />);
    const chatButton = screen.getByTitle('Open SkillMart Study Adviser Bot');
    fireEvent.click(chatButton);
    
    expect(screen.getByText('SkillMart Study Adviser')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask me anything about studying or SkillMart...')).toBeInTheDocument();
  });

  test('displays initial bot message', () => {
    render(<Chatbot />);
    const chatButton = screen.getByTitle('Open SkillMart Study Adviser Bot');
    fireEvent.click(chatButton);
    
    expect(screen.getByText(/Hello! I'm the SkillMart Study Adviser Bot/)).toBeInTheDocument();
  });

  test('sends message and displays user message', async () => {
    const mockResponse = {
      success: true,
      data: { response: 'This is a test response' }
    };
    
    sendMessageToBot.mockResolvedValue(mockResponse);

    render(<Chatbot />);
    const chatButton = screen.getByTitle('Open SkillMart Study Adviser Bot');
    fireEvent.click(chatButton);
    
    const input = screen.getByPlaceholderText('Ask me anything about studying or SkillMart...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(sendMessageToBot).toHaveBeenCalledWith('Test message');
      expect(screen.getByText('This is a test response')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    sendMessageToBot.mockRejectedValue(new Error('API Error'));

    render(<Chatbot />);
    const chatButton = screen.getByTitle('Open SkillMart Study Adviser Bot');
    fireEvent.click(chatButton);
    
    const input = screen.getByPlaceholderText('Ask me anything about studying or SkillMart...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/I'm sorry, I'm having trouble responding right now/)).toBeInTheDocument();
    });
  });

  test('closes chat window when close button is clicked', () => {
    render(<Chatbot />);
    const chatButton = screen.getByTitle('Open SkillMart Study Adviser Bot');
    fireEvent.click(chatButton);
    
    expect(screen.getByText('SkillMart Study Adviser')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('SkillMart Study Adviser')).not.toBeInTheDocument();
  });

  test('shows clear chat button', () => {
    render(<Chatbot />);
    const chatButton = screen.getByTitle('Open SkillMart Study Adviser Bot');
    fireEvent.click(chatButton);
    
    expect(screen.getByTitle('Clear Chat (Ctrl+K)')).toBeInTheDocument();
  });

  test('formats bold text correctly', () => {
    const { formatMessage } = require('../Chatbot');
    
    const testText = 'This is **bold text** and normal text';
    const result = formatMessage(testText);
    
    expect(result.__html).toContain('<strong>bold text</strong>');
  });
});
