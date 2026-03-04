import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/appStore';
import { getTheme } from '../src/theme/colors';
import { mockLearningModules, badges } from '../src/data/mockLearning';
import { LearningModule, Lesson } from '../src/types';

export default function ProtectScreen() {
  const { isDarkMode, progress, completeLesson, addBadge, addPoints, updateStreak } = useAppStore();
  const theme = getTheme(isDarkMode);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  const totalLessons = useMemo(() => {
    return mockLearningModules.reduce((acc, m) => acc + m.lessons.length, 0);
  }, []);

  const overallProgress = useMemo(() => {
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  }, [progress.completedLessons, totalLessons]);

  const getModuleProgress = (module: LearningModule) => {
    const completed = module.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  const handleCompleteLesson = () => {
    if (selectedLesson) {
      completeLesson(selectedLesson.id);
      updateStreak();
      
      // Check for badges
      if (progress.completedLessons.length === 0) {
        addBadge('first_lesson');
        Alert.alert('Badge débloqué !', 'Premier pas - Vous avez complété votre première leçon !');
      }
      
      // Check if module is complete
      if (selectedModule) {
        const moduleComplete = selectedModule.lessons.every(
          l => progress.completedLessons.includes(l.id) || l.id === selectedLesson.id
        );
        if (moduleComplete && selectedModule.id === 'level0') {
          addBadge('level0_complete');
          Alert.alert('Badge débloqué !', 'Fondations solides - Niveau 0 complété !');
        }
      }
    }
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (selectedLesson?.quiz) {
      const isCorrect = index === selectedLesson.quiz.correctIndex;
      setQuizResult(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        addPoints(20);
      }
    }
  };

  const closeLesson = () => {
    setSelectedLesson(null);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizResult(null);
  };

  const unlockedBadges = badges.filter(b => progress.badges.includes(b.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Se protéger</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Parcours de formation</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={[styles.statBadge, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="flame" size={16} color={theme.primary} />
            <Text style={[styles.statText, { color: theme.primary }]}>{progress.streak}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: theme.accent + '20' }]}>
            <Ionicons name="star" size={16} color={theme.accent} />
            <Text style={[styles.statText, { color: theme.accent }]}>{progress.totalPoints}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Votre progression</Text>
            <Text style={[styles.progressPercent, { color: theme.primary }]}>{overallProgress}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${overallProgress}%` }]} />
          </View>
          <Text style={[styles.progressSubtext, { color: theme.textSecondary }]}>
            {progress.completedLessons.length} / {totalLessons} leçons complétées
          </Text>
        </View>

        {/* Badges */}
        {unlockedBadges.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Vos badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {unlockedBadges.map(badge => (
                <View key={badge.id} style={[styles.badgeCard, { backgroundColor: theme.surface }]}>
                  <View style={[styles.badgeIcon, { backgroundColor: theme.accent + '20' }]}>
                    <Ionicons name={badge.icon as any} size={24} color={theme.accent} />
                  </View>
                  <Text style={[styles.badgeName, { color: theme.text }]}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Modules */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Niveaux</Text>
        {mockLearningModules.map(module => {
          const moduleProgress = getModuleProgress(module);
          return (
            <TouchableOpacity
              key={module.id}
              style={[styles.moduleCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
              onPress={() => setSelectedModule(module)}
              activeOpacity={0.7}
            >
              <View style={[styles.moduleIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name={module.icon as any} size={28} color={theme.primary} />
              </View>
              <View style={styles.moduleInfo}>
                <View style={styles.moduleHeader}>
                  <Text style={[styles.moduleLevelName, { color: theme.textMuted }]}>
                    Niveau {module.level} • {module.levelName}
                  </Text>
                  <Text style={[styles.moduleDuration, { color: theme.textSecondary }]}>{module.duration}</Text>
                </View>
                <Text style={[styles.moduleTitle, { color: theme.text }]}>{module.title}</Text>
                <Text style={[styles.moduleDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                  {module.description}
                </Text>
                <View style={styles.moduleProgress}>
                  <View style={[styles.moduleProgressBar, { backgroundColor: theme.border }]}>
                    <View 
                      style={[
                        styles.moduleProgressFill, 
                        { backgroundColor: moduleProgress === 100 ? theme.success : theme.primary, width: `${moduleProgress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.moduleProgressText, { color: theme.textMuted }]}>
                    {moduleProgress}%
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Module Detail Modal */}
      <Modal visible={!!selectedModule && !selectedLesson} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedModule(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedModule?.title}</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedModule && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                <Text style={[styles.lessonListTitle, { color: theme.text }]}>Leçons</Text>
                {selectedModule.lessons.map((lesson, index) => {
                  const isCompleted = progress.completedLessons.includes(lesson.id);
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[styles.lessonCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                      onPress={() => setSelectedLesson(lesson)}
                    >
                      <View style={[
                        styles.lessonNumber,
                        { backgroundColor: isCompleted ? theme.success : theme.primary + '20' }
                      ]}>
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        ) : (
                          <Text style={[styles.lessonNumberText, { color: theme.primary }]}>{index + 1}</Text>
                        )}
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={[styles.lessonTitle, { color: theme.text }]}>{lesson.title}</Text>
                        {lesson.quiz && (
                          <View style={styles.quizBadge}>
                            <Ionicons name="help-circle" size={12} color={theme.warning} />
                            <Text style={[styles.quizBadgeText, { color: theme.warning }]}>Quiz</Text>
                          </View>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 100 }} />
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Lesson Detail Modal */}
      <Modal visible={!!selectedLesson} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={closeLesson}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                {selectedLesson?.title}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedLesson && !showQuiz && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                <Text style={[styles.lessonContent, { color: theme.textSecondary }]}>
                  {selectedLesson.content}
                </Text>

                <View style={[styles.tipsSection, { backgroundColor: theme.primary + '10' }]}>
                  <View style={styles.tipHeader}>
                    <Ionicons name="bulb" size={20} color={theme.primary} />
                    <Text style={[styles.tipTitle, { color: theme.text }]}>Conseils pratiques</Text>
                  </View>
                  {selectedLesson.tips.map((tip, i) => (
                    <View key={i} style={styles.tipItem}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                      <Text style={[styles.tipText, { color: theme.textSecondary }]}>{tip}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.lessonActions}>
                  {selectedLesson.quiz && !progress.completedLessons.includes(selectedLesson.id) && (
                    <TouchableOpacity
                      style={[styles.quizButton, { backgroundColor: theme.warning }]}
                      onPress={() => setShowQuiz(true)}
                    >
                      <Ionicons name="help-circle" size={20} color="#fff" />
                      <Text style={styles.quizButtonText}>Passer le quiz</Text>
                    </TouchableOpacity>
                  )}
                  
                  {!progress.completedLessons.includes(selectedLesson.id) && (
                    <TouchableOpacity
                      style={[styles.completeButton, { backgroundColor: theme.success }]}
                      onPress={() => {
                        handleCompleteLesson();
                        Alert.alert('Bravo !', '+10 points');
                        closeLesson();
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.completeButtonText}>Marquer comme terminé</Text>
                    </TouchableOpacity>
                  )}
                  
                  {progress.completedLessons.includes(selectedLesson.id) && (
                    <View style={[styles.completedBadge, { backgroundColor: theme.success + '20' }]}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                      <Text style={[styles.completedText, { color: theme.success }]}>Leçon terminée</Text>
                    </View>
                  )}
                </View>

                <View style={{ height: 100 }} />
              </ScrollView>
            )}

            {/* Quiz View */}
            {selectedLesson && showQuiz && selectedLesson.quiz && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                <View style={[styles.quizCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.quizQuestion, { color: theme.text }]}>
                    {selectedLesson.quiz.question}
                  </Text>
                  
                  {selectedLesson.quiz.options.map((option, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === selectedLesson.quiz!.correctIndex;
                    let bgColor = theme.surfaceElevated;
                    let borderColor = theme.border;
                    
                    if (quizResult && isSelected) {
                      bgColor = quizResult === 'correct' ? theme.success + '20' : theme.danger + '20';
                      borderColor = quizResult === 'correct' ? theme.success : theme.danger;
                    } else if (quizResult && isCorrect) {
                      bgColor = theme.success + '20';
                      borderColor = theme.success;
                    }
                    
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.quizOption, { backgroundColor: bgColor, borderColor }]}
                        onPress={() => !quizResult && handleQuizAnswer(i)}
                        disabled={!!quizResult}
                      >
                        <Text style={[styles.quizOptionText, { color: theme.text }]}>{option}</Text>
                        {quizResult && isCorrect && (
                          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                        )}
                        {quizResult && isSelected && !isCorrect && (
                          <Ionicons name="close-circle" size={20} color={theme.danger} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  
                  {quizResult && (
                    <View style={[styles.quizExplanation, { backgroundColor: theme.primary + '10' }]}>
                      <Text style={[styles.quizExplanationTitle, { color: theme.text }]}>
                        {quizResult === 'correct' ? 'Bravo ! +20 points' : 'Pas tout à fait...'}
                      </Text>
                      <Text style={[styles.quizExplanationText, { color: theme.textSecondary }]}>
                        {selectedLesson.quiz.explanation}
                      </Text>
                    </View>
                  )}
                  
                  {quizResult && (
                    <TouchableOpacity
                      style={[styles.continueButton, { backgroundColor: theme.primary }]}
                      onPress={() => {
                        handleCompleteLesson();
                        closeLesson();
                      }}
                    >
                      <Text style={styles.continueButtonText}>Continuer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 13,
  },
  badgesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  badgeCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    width: 90,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  moduleLevelName: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  moduleDuration: {
    fontSize: 11,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  moduleDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  moduleProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  moduleProgressText: {
    fontSize: 11,
    fontWeight: '600',
    width: 32,
  },
  modalOverlay: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalContent: {
    flex: 1,
  },
  lessonListTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  quizBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  lessonContent: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 20,
  },
  tipsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
  },
  lessonActions: {
    gap: 12,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quizCard: {
    borderRadius: 16,
    padding: 20,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 20,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  quizOptionText: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  quizExplanation: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  quizExplanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quizExplanationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  continueButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
