import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI companion app', () => {
  render(<App />);
  
  // 检查是否渲染了主要组件
  const appElement = screen.getByText(/AI伴侣/i);
  expect(appElement).toBeInTheDocument();
});

test('renders chat interface', () => {
  render(<App />);
  
  // 检查是否有输入框
  const inputElement = screen.getByPlaceholderText(/输入您的消息/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders header component', () => {
  render(<App />);
  
  // 检查是否有标题
  const headerElement = screen.getByText(/智能对话助手/i);
  expect(headerElement).toBeInTheDocument();
});