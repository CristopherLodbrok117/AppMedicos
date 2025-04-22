// import React, { useRef, useEffect, useState } from 'react';
// import { ScrollView, View, Text, Dimensions, StyleSheet } from 'react-native';

// const HorizontalScrollPicker = ({ 
//   numbers, 
//   value, 
//   onValueChange, 
//   itemWidth = 80,
//   selectedColor = '#000',
// }) => {
//   const scrollRef = useRef(null);
//   const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
//   const padding = (containerWidth - itemWidth) / 2;
//   const [internalValue, setInternalValue] = useState(value || numbers[0]);
//   const scrollTimeout = useRef(null);

//   const handleContainerLayout = (event) => {
//     setContainerWidth(event.nativeEvent.layout.width);
//   };

//   useEffect(() => {
//     if (value !== undefined && value !== internalValue) {
//       setInternalValue(value);
//       scrollToValue(value);
//     }
//   }, [value]);

//   useEffect(() => {
//     scrollToValue(internalValue);
//   }, []);

//   const scrollToValue = (targetValue) => {
//     const index = numbers.indexOf(targetValue);
//     if (index !== -1 && scrollRef.current) {
//       const scrollPosition = index * itemWidth;
//       scrollRef.current.scrollTo({
//         x: scrollPosition,
//         animated: true
//       });
//     }
//   };

//   const handleScroll = (event) => {
//     if (scrollTimeout.current) {
//       clearTimeout(scrollTimeout.current);
//     }

//     scrollTimeout.current = setTimeout(() => {
//       const offsetX = event.nativeEvent.contentOffset.x;
//       const index = Math.round(offsetX / itemWidth);
//       const clampedIndex = Math.max(0, Math.min(index, numbers.length - 1));
//       const selectedValue = numbers[clampedIndex];

//       if (selectedValue !== internalValue) {
//         setInternalValue(selectedValue);
//         console.log('Selected value:', selectedValue);
//         onValueChange?.(selectedValue);
//       }
//     }, 100); // debounce de 100ms
//   };

//   return (
//     <View style={styles.container} onLayout={handleContainerLayout}>
//       <ScrollView
//         ref={scrollRef}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         snapToInterval={itemWidth}
//         decelerationRate="fast"
//         onScroll={handleScroll}
//         scrollEventThrottle={16} // importante para onScroll
//         contentContainerStyle={{
//           paddingHorizontal: padding,
//         }}
//       >
//         {numbers.map((number) => (
//           <View 
//             key={number} 
//             style={[styles.item, { width: itemWidth }]}
//           >
//             <Text style={[
//               styles.text,
//               number === internalValue && { 
//                 ...styles.selectedText,
//                 color: selectedColor
//               }
//             ]}>
//               {number}
//             </Text>
//           </View>
//         ))}
//       </ScrollView>
//       <View style={[styles.selectionIndicator, { left: containerWidth / 2 }]} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     height: 150,
//     justifyContent: 'center',
//   },
//   item: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   text: {
//     fontSize: 24,
//     color: '#888',
//   },
//   selectedText: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   selectionIndicator: {
//     position: 'absolute',
//     width: 2,
//     height: '40%',
//     backgroundColor: '#000',
//     top: '30%',
//   },
// });

// export default HorizontalScrollPicker;

import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, View, Text, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HorizontalScrollPicker = ({ 
  numbers, 
  value, 
  onValueChange, 
  itemWidth = 80,
  selectedColor = '#000',
}) => {
  const scrollRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const padding = (containerWidth - itemWidth) / 2;
  const [internalValue, setInternalValue] = useState(value || numbers[0]);
  const scrollTimeout = useRef(null);

  const handleContainerLayout = (event) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
      scrollToValue(value);
    }
  }, [value]);

  useEffect(() => {
    scrollToValue(internalValue);
  }, []);

  const scrollToValue = (targetValue) => {
    const index = numbers.indexOf(targetValue);
    if (index !== -1 && scrollRef.current) {
      const scrollPosition = index * itemWidth;
      scrollRef.current.scrollTo({
        x: scrollPosition,
        animated: true
      });
    }
  };

  const handleScroll = (event) => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

  // ⚠️ Guárdalo antes del timeout
  const offsetX = event.nativeEvent.contentOffset.x;

  scrollTimeout.current = setTimeout(() => {
    const index = Math.round(offsetX / itemWidth);
    const clampedIndex = Math.max(0, Math.min(index, numbers.length - 1));
    const selectedValue = numbers[clampedIndex];

    if (selectedValue !== internalValue) {
      setInternalValue(selectedValue);
      onValueChange?.(selectedValue);
    }
  }, 100);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
        style={[styles.fade, { left: 0 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
        style={[styles.fade, { right: 0 }]}
        pointerEvents="none"
      />

      <View style={styles.container} onLayout={handleContainerLayout}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: padding,
          }}
        >
          {numbers.map((number) => (
            <View 
              key={number} 
              style={[styles.item, { width: itemWidth }]}
            >
              <Text style={[
                styles.text,
                number === internalValue && { 
                  ...styles.selectedText,
                  color: selectedColor
                }
              ]}>
                {number}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.selectionIndicator, { left: (containerWidth / 2) -35 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    height: 150,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  container: {
    height: 150,
    justifyContent: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: '#888',
  },
  selectedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  selectionIndicator: {
    position: 'absolute',
    // left: '15%',
    width: 70,
    height: '40%',
    backgroundColor: '#0002',
    top: '30%',
    borderRadius: 15,
  },
  fade: {
    position: 'absolute',
    width: 50,
    height: '100%',
    zIndex: 2,
  },
});

export default HorizontalScrollPicker;
