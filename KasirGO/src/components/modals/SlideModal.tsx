import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { PanGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen width to trigger close

interface SlideModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
}

export default function SlideModal({
  visible,
  onClose,
  children,
  backgroundColor = "#ffffff",
}: SlideModalProps) {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const gestureTranslateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out animation
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: SCREEN_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: gestureTranslateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;

      // Check if swipe meets threshold to close
      const shouldClose =
        translationX > SWIPE_THRESHOLD || velocityX > 500;

      if (shouldClose) {
        // Close the modal
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onClose();
          // Reset gesture translation
          gestureTranslateX.setValue(0);
        });
      } else {
        // Snap back to original position
        Animated.spring(gestureTranslateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }).start();
      }
    }
  };

  if (!visible && translateX.__getValue() === SCREEN_WIDTH) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: opacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Slide Panel */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetX={10}
          failOffsetX={-10}
        >
          <Animated.View
            style={[
              styles.panel,
              {
                backgroundColor,
                transform: [
                  { translateX: translateX },
                  { translateX: gestureTranslateX },
                ],
              },
            ]}
          >
            {children}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
});
