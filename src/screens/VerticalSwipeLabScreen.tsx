import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LabStage } from '../components/LabStage';
import { OVERLAYS } from '../constants/overlays';
import { useOverlayPager } from '../hooks/useOverlayPager';

type VerticalSwipeLabScreenProps = {
  onBack: () => void;
};

const DEFAULT_STAGE_HEIGHT = 500;

export function VerticalSwipeLabScreen({ onBack }: VerticalSwipeLabScreenProps) {
  const [stageHeight, setStageHeight] = useState(DEFAULT_STAGE_HEIGHT);
  const [liveIndexLabel, setLiveIndexLabel] = useState('1.00');
  const [distanceToSnapLabel, setDistanceToSnapLabel] = useState('0.00');
  const [showDebug, setShowDebug] = useState(false);
  const progressFill = useSharedValue(0);

  const pager = useOverlayPager({
    overlays: OVERLAYS,
    pageHeight: stageHeight,
    initialOverlay: 'overview',
    pagingEnabled: true,
    activationDistance: 8,
    snapThresholdRatio: 0.16,
    springDamping: 18,
  });

  const pages = useMemo(
    () =>
      OVERLAYS.map((overlay, index) => ({
        ...overlay,
        pageNumber: index + 1,
        indexLabel: `${index + 1} / ${OVERLAYS.length}`,
      })),
    [],
  );

  useAnimatedReaction(
    () => pager.animatedIndex.value,
    (value) => {
      const humanIndex = value + 1;
      const nearestPage = Math.round(value);
      const distanceToSnap = Math.abs(value - nearestPage);
      progressFill.value = OVERLAYS.length <= 1 ? 0 : value / (OVERLAYS.length - 1);
      runOnJS(setLiveIndexLabel)(humanIndex.toFixed(2));
      runOnJS(setDistanceToSnapLabel)(distanceToSnap.toFixed(2));
    },
    [pager.animatedIndex, progressFill],
  );

  const progressStyle = useAnimatedStyle(() => ({
    height: `${Math.max(8, progressFill.value * 100)}%`,
  }));

  const handleStageLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.max(1, Math.round(event.nativeEvent.layout.height));
    if (nextHeight !== stageHeight) {
      setStageHeight(nextHeight);
    }
  };

  const isDragging = pager.dragOwner === 'overlay';

  return (
    <LabStage
      title="Vertical Swipe Lab"
      subtitle="This lab now stays visually clean by default: only the three layers are visible, and debug can be opened from the button above the stage."
      onBack={onBack}
      scrollEnabled={false}
    >
      <View style={styles.screenBody}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showDebug }}
            onPress={() => setShowDebug((value) => !value)}
            style={({ pressed }) => [styles.debugToggle, showDebug ? styles.debugToggleActive : null, pressed ? styles.debugTogglePressed : null]}
          >
            <Text style={[styles.debugToggleText, showDebug ? styles.debugToggleTextActive : null]}>
              {showDebug ? 'Hide debug' : 'Show debug'}
            </Text>
          </Pressable>
        </View>

        <GestureDetector gesture={pager.gesture}>
          <View style={styles.stageFrame} onLayout={handleStageLayout}>
            <View style={styles.backgroundLayer} />

            <View pointerEvents="none" style={styles.middleLayer}>
              <View style={styles.crosshairHorizontal} />
              <View style={styles.crosshairVertical} />
              <View style={styles.centerAnchor}>
                <View style={styles.centerDotOuter}>
                  <View style={styles.centerDotInner} />
                </View>
              </View>
            </View>

            {showDebug ? (
              <>
                <View pointerEvents="none" style={styles.pageRail}>
                  {pages.map((page) => {
                    const isActivePage = page.key === pager.activeOverlay;
                    return (
                      <View key={page.key} style={[styles.pageRailItem, isActivePage ? styles.pageRailItemActive : null]}>
                        <Text style={[styles.pageRailItemText, isActivePage ? styles.pageRailItemTextActive : null]}>
                          {page.pageNumber}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View pointerEvents="none" style={styles.progressTrackShell}>
                  <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, progressStyle]} />
                  </View>
                </View>
              </>
            ) : null}

            <View style={styles.overlayViewport}>
              <Animated.View style={[styles.overlayPager, { height: stageHeight * pages.length }, pager.containerStyle]}>
                {pages.map((page) => {
                  const isActivePage = page.key === pager.activeOverlay;
                  return (
                    <View key={page.key} style={[styles.overlayPage, { height: stageHeight }]}>
                      {showDebug ? <View style={styles.pageDebugFrame} /> : null}

                      <View style={[styles.overlayCard, isActivePage ? styles.overlayCardActive : null]}>
                        <Text style={styles.overlayTitle}>{page.label}</Text>
                        <Text style={styles.overlayBody}>{page.description}</Text>
                      </View>
                    </View>
                  );
                })}
              </Animated.View>
            </View>

            {showDebug ? (
              <View style={styles.debugOverlay}>
                <View style={styles.debugPanel}>
                  <View style={styles.debugPanelHeader}>
                    <Text style={styles.debugPanelTitle}>Swipe debug</Text>
                    <Text style={styles.debugPanelSubtitle}>Hidden by default so the stage stays close to the real mobile view.</Text>
                  </View>

                  <View style={styles.debugInfoGrid}>
                    <View style={styles.debugInfoChip}>
                      <Text style={styles.debugInfoLabel}>active page</Text>
                      <Text style={styles.debugInfoValue}>{pager.activeOverlayLabel}</Text>
                    </View>

                    <View style={styles.debugInfoChip}>
                      <Text style={styles.debugInfoLabel}>drag state</Text>
                      <Text style={styles.debugInfoValue}>{isDragging ? 'dragging' : 'resting'}</Text>
                    </View>

                    <View style={styles.debugInfoChip}>
                      <Text style={styles.debugInfoLabel}>live index</Text>
                      <Text style={styles.debugInfoValue}>{liveIndexLabel}</Text>
                    </View>

                    <View style={styles.debugInfoChip}>
                      <Text style={styles.debugInfoLabel}>snap distance</Text>
                      <Text style={styles.debugInfoValue}>{distanceToSnapLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.quickJumpRow}>
                    {pages.map((page) => {
                      const isActivePage = page.key === pager.activeOverlay;
                      return (
                        <Pressable
                          key={page.key}
                          accessibilityRole="button"
                          onPress={() => pager.goToOverlay(page.key)}
                          style={({ pressed }) => [
                            styles.quickJumpButton,
                            isActivePage ? styles.quickJumpButtonActive : null,
                            pressed ? styles.quickJumpButtonPressed : null,
                          ]}
                        >
                          <Text style={[styles.quickJumpButtonText, isActivePage ? styles.quickJumpButtonTextActive : null]}>
                            {page.pageNumber}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </GestureDetector>
      </View>
    </LabStage>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  debugToggle: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  debugToggleActive: {
    backgroundColor: '#000000',
  },
  debugTogglePressed: {
    opacity: 0.75,
  },
  debugToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  debugToggleTextActive: {
    color: '#ffffff',
  },
  stageFrame: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  middleLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairHorizontal: {
    position: 'absolute',
    left: 32,
    right: 32,
    height: 1,
    backgroundColor: '#000000',
    opacity: 0.14,
  },
  crosshairVertical: {
    position: 'absolute',
    top: 32,
    bottom: 32,
    width: 1,
    backgroundColor: '#000000',
    opacity: 0.14,
  },
  centerAnchor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDotOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  centerDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  overlayViewport: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  overlayPager: {
    width: '100%',
  },
  overlayPage: {
    width: '100%',
    paddingHorizontal: 26,
    paddingVertical: 26,
    justifyContent: 'center',
  },
  pageDebugFrame: {
    ...StyleSheet.absoluteFillObject,
    left: 26,
    right: 26,
    top: 26,
    bottom: 26,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  overlayCard: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    gap: 10,
  },
  overlayCardActive: {
    borderWidth: 2,
  },
  overlayTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'capitalize',
  },
  overlayBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
  },
  pageRail: {
    position: 'absolute',
    left: 12,
    top: 76,
    bottom: 22,
    justifyContent: 'center',
    gap: 8,
    zIndex: 8,
  },
  pageRailItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  pageRailItemActive: {
    backgroundColor: '#000000',
  },
  pageRailItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  pageRailItemTextActive: {
    color: '#ffffff',
  },
  progressTrackShell: {
    position: 'absolute',
    right: 12,
    top: 84,
    bottom: 30,
    justifyContent: 'center',
    zIndex: 8,
  },
  progressTrack: {
    width: 10,
    height: 116,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  progressFill: {
    width: '100%',
    backgroundColor: '#000000',
    minHeight: 8,
  },
  debugOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    paddingTop: 14,
    paddingHorizontal: 14,
    zIndex: 20,
    pointerEvents: 'box-none',
  },
  debugPanel: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    gap: 12,
  },
  debugPanelHeader: {
    gap: 3,
  },
  debugPanelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  debugPanelSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#000000',
  },
  debugInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  debugInfoChip: {
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 3,
    flexGrow: 1,
  },
  debugInfoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  debugInfoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  quickJumpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickJumpButton: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  quickJumpButtonActive: {
    backgroundColor: '#000000',
  },
  quickJumpButtonPressed: {
    opacity: 0.75,
  },
  quickJumpButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  quickJumpButtonTextActive: {
    color: '#ffffff',
  },
});
