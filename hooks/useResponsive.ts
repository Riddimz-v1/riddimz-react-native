import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.TABLET;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  const isDesktop = width >= BREAKPOINTS.DESKTOP;
  const isLargeScreen = width >= BREAKPOINTS.TABLET;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
  };
}
