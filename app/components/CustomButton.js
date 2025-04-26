import React from 'react';
import { Pressable, Text, StyleSheet, Animated, Platform, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomButton = ({ 
  title,
  onPress,
  backgroundColor = '#898989',
  fontSize = 16,
  padding = 5,
  margin = 10,
  hoverColor = '#cacaca',
  pressColor = '#cacaca',
  disabled = false,
  icon,
  iconColor = 'white',
  iconSize = 24
}) => {
  const scaleValue = new Animated.Value(1);

  const animateIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={animateIn}
      onPressOut={animateOut}
      hovered={Platform.select({ web: undefined, default: undefined })}
    >
      {({ pressed, hovered }) => (
        <Animated.View 
          style={[
            styles.button,
            {
              transform: [{ scale: scaleValue }],
              backgroundColor: 
                pressed ? pressColor : 
                hovered ? hoverColor : 
                backgroundColor,
              opacity: disabled ? 0.6 : 1,
              paddingVertical: padding,
              paddingHorizontal: padding * 2,
              marginVertical: margin,
            }
          ]}
        >
          <View style={styles.contentContainer}>
            {icon && (
              <Icon 
                name={icon}
                size={iconSize}
                color={iconColor}
                style={styles.icon}
              />
            )}
            <Text style={[styles.text, { fontSize }]}>
              {title}
            </Text>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
};

// ... keep the same styles as before

const styles = StyleSheet.create({
  button: {
    maxWidth: 300,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    
    alignSelf: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    
    marginRight: 8, // Space between icon and text
  },
  text: {
    fontWeight: '600',
    color: 'white',
  },
});

export default CustomButton;