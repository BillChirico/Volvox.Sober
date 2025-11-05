import React from 'react';

/**
 * Recursively extracts text content from React children.
 *
 * This function traverses React element trees to find and concatenate all text nodes.
 * It prevents the "[object Object]" bug that occurs when using String(children)
 * on React elements.
 *
 * @param children - React children of any type
 * @returns Concatenated text content, or empty string if no text found
 *
 * @example
 * extractTextContent("Submit") // => "Submit"
 * extractTextContent(<Text>Delete</Text>) // => "Delete"
 * extractTextContent(<View><Text>Edit</Text></View>) // => "Edit"
 * extractTextContent([<Icon />, <Text>Send</Text>]) // => "Send"
 * extractTextContent(<Icon />) // => ""
 */
export function extractTextContent(children: React.ReactNode): string {
  // Handle primitive types (strings and numbers)
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  // Handle React elements - recursively extract from their children
  if (React.isValidElement(children)) {
    const childProps = children.props as { children?: React.ReactNode };
    return childProps.children ? extractTextContent(childProps.children) : '';
  }

  // Handle arrays - recursively extract from each element and concatenate with spaces
  if (Array.isArray(children)) {
    return children
      .map(extractTextContent)
      .filter(Boolean) // Remove empty strings
      .join(' '); // Join with spaces
  }

  // Handle null, undefined, boolean (React ignores these)
  return '';
}
