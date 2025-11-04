# AccessibleButton: Preventing the "[object Object]" Accessibility Bug

## Problem

When creating accessible buttons in React Native, a common anti-pattern is using `String(children)` as a fallback for `accessibilityLabel`. This produces the meaningless label "[object Object]" when children contain React elements (like icons), breaking screen reader accessibility.

```tsx
// ❌ BROKEN PATTERN
const BadButton = ({ children, accessibilityLabel }) => (
  <TouchableOpacity
    accessibilityLabel={accessibilityLabel || String(children)} // BUG!
    onPress={...}
  >
    {children}
  </TouchableOpacity>
);

// Usage that breaks:
<BadButton>
  <Icon name="send" />  // String(<Icon />) = "[object Object]"
</BadButton>
```

## Root Cause

- React elements are JavaScript objects
- `String(object)` calls `object.toString()`
- Objects without custom `toString()` return `"[object Object]"`
- Screen readers announce meaningless "[object Object]"

## Solution

### 1. Text Extraction Utility (`extractTextContent.ts`)

Instead of `String(children)`, we recursively extract actual text content:

```tsx
function extractTextContent(children: React.ReactNode): string {
  // Strings/numbers → return directly
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  // React elements → recursively extract from props.children
  if (React.isValidElement(children)) {
    return children.props.children
      ? extractTextContent(children.props.children)
      : '';
  }

  // Arrays → map and concatenate with spaces
  if (Array.isArray(children)) {
    return children
      .map(extractTextContent)
      .filter(Boolean)
      .join(' ');
  }

  // null, undefined, boolean → return empty string
  return '';
}
```

**Key Benefits:**
- ✅ `<Text>Label</Text>` → extracts "Label"
- ✅ `[<Icon />, <Text>Send</Text>]` → extracts "Send" (ignores Icon)
- ✅ `<View><Text>Submit</Text></View>` → recursively finds "Submit"
- ✅ `<Icon />` → returns empty string (forces explicit label requirement)
- ❌ Never produces "[object Object]"!

### 2. AccessibleButton Component

Wraps TouchableOpacity with proper accessibility:

```tsx
export const AccessibleButton = ({
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  ...props
}) => {
  // Use explicit label if provided, otherwise extract from children
  const label = accessibilityLabel || extractTextContent(children);

  // Warn in development if no label found
  if (__DEV__ && !label) {
    console.warn(
      'AccessibleButton: No accessibility label found. ' +
      'For icon-only buttons, provide explicit accessibilityLabel.'
    );
  }

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={label || undefined}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};
```

## Usage Examples

### ✅ Good: String children (automatic extraction)
```tsx
<AccessibleButton onPress={handleSubmit}>
  Submit
</AccessibleButton>
// Label: "Submit"
```

### ✅ Good: Text component (automatic extraction)
```tsx
<AccessibleButton onPress={handleDelete}>
  <Text>Delete</Text>
</AccessibleButton>
// Label: "Delete"
```

### ✅ Good: Icon-only (explicit label required)
```tsx
<AccessibleButton
  accessibilityLabel="Send message"
  onPress={handleSend}
>
  <SendIcon />
</AccessibleButton>
// Label: "Send message"
```

### ✅ Good: Mixed icon + text (automatic extraction)
```tsx
<AccessibleButton onPress={handleEdit}>
  <EditIcon />
  <Text>Edit</Text>
</AccessibleButton>
// Label: "Edit"
```

### ✅ Good: Nested structures (recursive extraction)
```tsx
<AccessibleButton onPress={handleSave}>
  <View>
    <Text>Save</Text>
    <Text>Changes</Text>
  </View>
</AccessibleButton>
// Label: "Save Changes"
```

## Testing

All 12 test cases pass ✅:

### Accessibility Label Extraction (8 tests)
1. ✅ Explicit accessibilityLabel takes precedence
2. ✅ Extracts text from string children
3. ✅ Extracts text from Text component children
4. ✅ Extracts text from nested View/Text structures
5. ✅ Concatenates multiple Text children with spaces
6. ✅ Does NOT produce "[object Object]" for icon-only children
7. ✅ Extracts text from mixed icon + text children
8. ✅ Handles complex nested structures

### Accessibility Properties (3 tests)
9. ✅ Button is accessible by default
10. ✅ Supports accessibilityHint
11. ✅ Supports accessibilityRole

### Button Behavior (1 test)
12. ✅ Calls onPress when pressed

## Files Created

```
mobile/
├── src/
│   ├── utils/
│   │   └── extractTextContent.ts          # Text extraction utility
│   └── components/
│       ├── AccessibleButton.tsx           # Main component
│       └── index.ts                       # Export convenience
├── tests/
│   └── components/
│       └── AccessibleButton.test.tsx      # 12 test cases
├── docs/
│   └── accessibility-button-solution.md   # This document
└── jest.config.js                         # Jest configuration

```

## Migration Guide

### Existing TouchableOpacity Usage

Current code has many TouchableOpacity instances WITHOUT accessibility labels:

**Before:**
```tsx
<TouchableOpacity
  style={styles.sendButton}
  onPress={handleSend}
>
  <SendIcon />
</TouchableOpacity>
```

**After:**
```tsx
<AccessibleButton
  accessibilityLabel="Send message"
  style={styles.sendButton}
  onPress={handleSend}
>
  <SendIcon />
</AccessibleButton>
```

### Files to Update

Search for `TouchableOpacity` usage in:
- `mobile/src/screens/CheckInSchedulingScreen.tsx`
- `mobile/src/screens/ConversationListScreen.tsx`
- `mobile/src/screens/CheckInResponseScreen.tsx`
- `mobile/src/components/MessageInput.tsx`
- `mobile/src/components/QuestionBuilder.tsx`
- `mobile/src/components/TimePickerInput.tsx`
- `mobile/src/components/RecurrenceSelector.tsx`

## React Native Accessibility Best Practices

As per official React Native documentation:

1. **Always provide accessibilityLabel** for elements that don't have meaningful text
2. **Use accessibilityHint** to provide additional context about action results
3. **Set accessibilityRole** to help screen readers understand element purpose
4. **Make elements accessible={true}** to ensure discoverability

The AccessibleButton component follows all these best practices automatically.

## References

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS VoiceOver Programming Guide](https://developer.apple.com/accessibility/ios/)
- [Android TalkBack Documentation](https://support.google.com/accessibility/android/)
