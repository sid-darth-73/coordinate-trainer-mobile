import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { PIECE_SVGS } from '../constants/piecesSvg';

interface ChessPieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  size: number;
}

export const ChessPiece = React.memo<ChessPieceProps>(({ type, color, size }) => {
  const pieceKey = `${color}${type.toUpperCase()}`;
  const svgXml = PIECE_SVGS[pieceKey];

  if (!svgXml) {
    return null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      <SvgXml xml={svgXml} width={size * 0.88} height={size * 0.88} />
    </View>
  );
});

ChessPiece.displayName = 'ChessPiece';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
