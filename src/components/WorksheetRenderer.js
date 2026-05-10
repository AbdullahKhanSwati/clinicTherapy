import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';

// Import question type components
import TextQuestion from './QuestionTypes/TextQuestion';
import TextAreaQuestion from './QuestionTypes/TextAreaQuestion';
import SliderQuestion from './QuestionTypes/SliderQuestion';
import MultipleChoiceQuestion from './QuestionTypes/MultipleChoiceQuestion';
import EmotionSelector from './QuestionTypes/EmotionSelector';
import InformationBlock from './QuestionTypes/InformationBlock';
import ReflectionNote from './QuestionTypes/ReflectionNote';
import TherapistInsight from './QuestionTypes/TherapistInsight';

export default function WorksheetRenderer({
  worksheet,
  onComplete,
  initialResponses = {},
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState(initialResponses);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const steps = worksheet.steps || [];
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Auto-save responses
  useEffect(() => {
    const saveResponses = async () => {
      if (Object.keys(responses).length > 0) {
        setIsAutoSaving(true);
        // In a real app, this would save to the backend
        // For now, it just logs to show it's happening
        console.log('[v0] Auto-saving responses:', responses);
        setIsAutoSaving(false);
      }
    };

    const timer = setTimeout(saveResponses, 2000);
    return () => clearTimeout(timer);
  }, [responses]);

  const handleResponse = (value) => {
    if (currentStep && currentStep.saveKey) {
      const newResponses = {
        ...responses,
        [currentStep.saveKey]: value,
      };
      setResponses(newResponses);
    }
  };

  const handleNext = () => {
    // Validate if required
    if (currentStep.required && currentStep.saveKey) {
      if (!responses[currentStep.saveKey]) {
        Alert.alert(
          'Required Field',
          'Please answer this question before continuing.',
        );
        return;
      }
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Show completion modal
      setCompletionModalVisible(true);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    setCompletionModalVisible(false);
    if (onComplete) {
      onComplete(responses);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Exit Worksheet',
      'Your progress will be saved. You can continue later.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Exit',
          onPress: () => {
            if (onComplete) {
              onComplete(responses, true); // true indicates it was skipped
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderQuestionComponent = () => {
    switch (currentStep.type) {
      case 'text':
        return (
          <TextQuestion
            question={currentStep}
            value={responses[currentStep.saveKey]}
            onChange={handleResponse}
            onNext={handleNext}
          />
        );
      case 'text-area':
        return (
          <TextAreaQuestion
            question={currentStep}
            value={responses[currentStep.saveKey]}
            onChange={handleResponse}
            onNext={handleNext}
          />
        );
      case 'slider':
        return (
          <SliderQuestion
            question={currentStep}
            value={responses[currentStep.saveKey]}
            onChange={handleResponse}
            onNext={handleNext}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            question={currentStep}
            value={responses[currentStep.saveKey]}
            onChange={handleResponse}
            onNext={handleNext}
          />
        );
      case 'emotion-selector':
        return (
          <EmotionSelector
            question={currentStep}
            value={responses[currentStep.saveKey]}
            onChange={handleResponse}
            onNext={handleNext}
          />
        );
      case 'information-block':
        return <InformationBlock question={currentStep} onNext={handleNext} />;
      case 'reflection-note':
        return <ReflectionNote question={currentStep} onNext={handleNext} />;
      case 'therapist-insight':
        return <TherapistInsight question={currentStep} onNext={handleNext} />;
      default:
        return <Text style={styles.errorText}>Unknown question type</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipButton}>Skip</Text>
          </TouchableOpacity>
          <Text style={styles.worksheetTitle}>{worksheet.title}</Text>
          <TouchableOpacity onPress={handleBack} disabled={currentStepIndex === 0}>
            <Text style={[styles.backButton, currentStepIndex === 0 && styles.backButtonDisabled]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>

        {/* Question Title and Prompt */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{currentStep.title}</Text>
          {currentStep.prompt && !['information-block', 'therapist-insight', 'reflection-note'].includes(currentStep.type) && (
            <Text style={styles.questionPrompt}>{currentStep.prompt}</Text>
          )}
        </View>

        {/* Question Component */}
        <View style={styles.answerContainer}>
          {renderQuestionComponent()}
        </View>

        {/* Therapist Insight (if available) */}
        {currentStepIndex === 0 && worksheet.therapistInsight && (
          <View style={styles.therapistInsightBox}>
            <Text style={styles.therapistLabel}>💡 For Therapists</Text>
            <Text style={styles.therapistText}>{worksheet.therapistInsight}</Text>
          </View>
        )}

        {/* Auto-save indicator */}
        {isAutoSaving && (
          <Text style={styles.savingText}>💾 Saving...</Text>
        )}
      </ScrollView>

      {/* Completion Modal */}
      <Modal
        visible={completionModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.completionModal}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Great Job!</Text>
            <Text style={styles.completionMessage}>
              {worksheet.completionMessage}
            </Text>
            <Text style={styles.responseCount}>
              You completed {steps.length} questions
            </Text>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  worksheetTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  skipButton: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  backButton: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  backButtonDisabled: {
    color: COLORS.gray300,
  },
  progressContainer: {
    marginBottom: SPACING['2xl'],
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: SPACING['2xl'],
  },
  questionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  questionPrompt: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray600,
    lineHeight: 22,
  },
  answerContainer: {
    flex: 1,
    minHeight: 200,
    marginBottom: SPACING.xl,
  },
  therapistInsightBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  therapistLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.info,
    marginBottom: SPACING.sm,
  },
  therapistText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  savingText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  completionModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING['2xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  completionEmoji: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  completionTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  completionMessage: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  responseCount: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xl,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    alignItems: 'center',
  },
  completeButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.base,
  },
});
