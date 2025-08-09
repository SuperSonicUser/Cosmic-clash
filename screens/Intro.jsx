import { View, Text, StyleSheet, Pressable  } from 'react-native'
import React from 'react'
import TypewriterText from './TypewriterText'

export default function Intro({navigation}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cosmic Clash</Text>
      <TypewriterText text="Enemies are coming to destroy the planet" style={styles.description} />
      <Pressable style={styles.button} onPress={() => navigation.navigate('Game')}>
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Poppins-regular',
    padding: 24,
    fontSize: 16,
    color: 'white',
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 12,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 30,
    marginTop: 24,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
  },
});

