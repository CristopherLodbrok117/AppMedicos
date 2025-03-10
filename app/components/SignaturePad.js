import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const SignaturePad = () => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const currentPathRef = useRef(currentPath);
  const viewRef = useRef(null);

  // Sync ref with currentPath state
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        // Add current path to completed paths using ref
        setPaths(prev => [...prev, currentPathRef.current]);
        setCurrentPath([]);
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const pathToSvg = (points) => {
    if (points.length === 0) return '';
    return points.reduce(
      (acc, point, index) => 
        `${acc}${index === 0 ? 'M' : 'L'}${point.x},${point.y} `,
      ''
    ).trim();
  };

  return (
    <View style={styles.container}>
      <View 
        style={styles.signatureContainer}
        ref={viewRef}
        {...panResponder.panHandlers}
        collapsable={false}
      >
        <Svg style={styles.svg}>
          {/* Render all completed paths */}
          {paths.map((path, index) => (
            <Path
              key={`path-${index}`}
              d={pathToSvg(path)}
              stroke="#000"
              fill="transparent"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Render current working path */}
          <Path
            d={pathToSvg(currentPath)}
            stroke="#000"
            fill="transparent"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
        <Text style={styles.clearButtonText}>Clear Signature</Text>
      </TouchableOpacity>
    </View>
  );
};


// Keep the same styles as previous version
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  signatureContainer: {
    width: '95%',
    height: '80%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  svg: {
    flex: 1,
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignaturePad;