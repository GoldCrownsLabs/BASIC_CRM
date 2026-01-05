import { Platform, ScrollViewProps } from 'react-native';

export const getScrollViewProps = (): Partial<ScrollViewProps> => {
  return {
    showsVerticalScrollIndicator: true,
    showsHorizontalScrollIndicator: false,
    bounces: true,
    overScrollMode: 'always',
    scrollEventThrottle: 16,
    decelerationRate: Platform.OS === 'ios' ? 0.998 : 0.985,
    nestedScrollEnabled: true,
    keyboardShouldPersistTaps: 'handled',
    contentContainerStyle: { flexGrow: 1 },
  };
};

export const getFlatListProps = () => {
  return {
    showsVerticalScrollIndicator: true,
    showsHorizontalScrollIndicator: false,
    bounces: true,
    scrollEventThrottle: 16,
    decelerationRate: Platform.OS === 'ios' ? 0.998 : 0.985,
    keyboardShouldPersistTaps: 'handled',
    contentContainerStyle: { paddingBottom: 20 },
  };
};