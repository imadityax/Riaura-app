import React, { useRef } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import NeuronTransition from '../components/NeuronTransition';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import MainTabNavigator from './MainTabNavigator';
import MindfulnessAssessScreen from '../screens/assess/MindfulnessAssessScreen';
import MindfulnessReportScreen from '../screens/assess/MindfulnessReportScreen';
import ActivityAssessScreen from '../screens/assess/ActivityAssessScreen';
import ActivityGameScreen from '../screens/assess/ActivityGameScreen';
import WebActivityScreen from '../screens/assess/WebActivityScreen';
import CompletionScreen from '../screens/CompletionScreen';

// Phase 1
import RegistrationScreen from '../screens/phase1/RegistrationScreen';
import ConsentScreen from '../screens/phase1/ConsentScreen';
import TermsScreen from '../screens/phase1/TermsScreen';

// Phase 2
import Phase2IntroScreen from '../screens/phase2/Phase2IntroScreen';
import DomainQuestionScreen from '../screens/phase2/DomainQuestionScreen';

// Phase 3
import Phase3IntroScreen from '../screens/phase3/Phase3IntroScreen';
import StroopTestScreen from '../screens/phase3/StroopTestScreen';
import NBackScreen from '../screens/phase3/NBackScreen';
import SymbolDigitScreen from '../screens/phase3/SymbolDigitScreen';
import MatrixReasoningScreen from '../screens/phase3/MatrixReasoningScreen';
import SituationalJudgementScreen from '../screens/phase3/SituationalJudgementScreen';
import EmotionRecognitionScreen from '../screens/phase3/EmotionRecognitionScreen';
import AlternativeUsesScreen from '../screens/phase3/AlternativeUsesScreen';
import ConfidenceCalibrationScreen from '../screens/phase3/ConfidenceCalibrationScreen';
import FireflyFreezeScreen from '../screens/phase3/FireflyFreezeScreen';

// Results
import HighPerformanceScreen from '../screens/results/HighPerformanceScreen';
import DevelopmentPathwayScreen from '../screens/results/DevelopmentPathwayScreen';

// Phase 4
import Phase4BookingScreen from '../screens/phase4/Phase4BookingScreen';
import Phase4InterviewScreen from '../screens/phase4/Phase4InterviewScreen';

// Profile sub-screens
import SettingsScreen    from '../screens/profile/SettingsScreen';
import PrivacyScreen     from '../screens/profile/PrivacyScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import AboutScreen       from '../screens/profile/AboutScreen';

// Home sub-screens
import NotificationsScreen from '../screens/home/NotificationsScreen';
import DNAScreen from '../screens/home/DNAScreen';
import GrowthScreen from '../screens/home/GrowthScreen';

// Final
import FinalReportScreen from '../screens/final/FinalReportScreen';

// Passport
import GoalsScreen from '../screens/passport/GoalsScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: '#F7F5FB' },
  ...TransitionPresets.SlideFromRightIOS,
  // Keep the natural slide transition, but no swipe-back — it would let
  // users accidentally exit a mid-assessment and lose progress.
  gestureEnabled: false,
};

// Full-screen moments read better as a cross-fade than a side-slide.
const fadeOptions = {
  ...TransitionPresets.ModalFadeTransition,
  gestureEnabled: false,
};

export default function AppNavigator() {
  // Neural "synapse burst" overlay played on every page swap (stack pushes,
  // pops and tab switches all change the navigation state).
  const neuronRef = useRef(null);

  return (
    <View style={{ flex: 1 }}>
    <NavigationContainer onStateChange={() => neuronRef.current?.play()}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
        <Stack.Screen name="Splash"        component={SplashScreen} options={fadeOptions} />
        <Stack.Screen name="Auth"          component={AuthScreen} />
        <Stack.Screen name="Main"          component={MainTabNavigator} />

        {/* Assessment */}
        <Stack.Screen name="MindfulnessAssess"  component={MindfulnessAssessScreen} />
        <Stack.Screen name="ActivityAssess"     component={ActivityAssessScreen} />
        <Stack.Screen name="ActivityGame"       component={ActivityGameScreen} />
        <Stack.Screen name="WebActivity"        component={WebActivityScreen} />
        <Stack.Screen name="MindfulnessReport"  component={MindfulnessReportScreen} options={fadeOptions} />
        <Stack.Screen name="Completion"         component={CompletionScreen} options={fadeOptions} />

        {/* Registration flow */}
        <Stack.Screen name="Registration"  component={RegistrationScreen} />
        <Stack.Screen name="Consent"       component={ConsentScreen} />
        <Stack.Screen name="Terms"         component={TermsScreen} />

        {/* Phase 2 */}
        <Stack.Screen name="Phase2Intro"   component={Phase2IntroScreen} />
        <Stack.Screen name="Phase2Questions" component={DomainQuestionScreen} />

        {/* Phase 3 */}
        <Stack.Screen name="Phase3Intro"   component={Phase3IntroScreen} />
        <Stack.Screen name="Task_Stroop"   component={StroopTestScreen} />
        <Stack.Screen name="Task_NBack"    component={NBackScreen} />
        <Stack.Screen name="Task_SymbolDigit" component={SymbolDigitScreen} />
        <Stack.Screen name="Task_Matrix"   component={MatrixReasoningScreen} />
        <Stack.Screen name="Task_SituationalJudgement" component={SituationalJudgementScreen} />
        <Stack.Screen name="Task_EmotionRecognition"   component={EmotionRecognitionScreen} />
        <Stack.Screen name="Task_AlternativeUses"      component={AlternativeUsesScreen} />
        <Stack.Screen name="Task_ConfidenceCalibration" component={ConfidenceCalibrationScreen} />
        <Stack.Screen name="Task_FireflyFreeze" component={FireflyFreezeScreen} options={fadeOptions} />

        {/* Results */}
        <Stack.Screen name="HighPerformance"    component={HighPerformanceScreen} />
        <Stack.Screen name="DevelopmentPathway" component={DevelopmentPathwayScreen} />

        {/* Phase 4 */}
        <Stack.Screen name="Phase4Booking"   component={Phase4BookingScreen} />
        <Stack.Screen name="Phase4Interview" component={Phase4InterviewScreen} />

        {/* Profile sub-screens */}
        <Stack.Screen name="Settings"    component={SettingsScreen} />
        <Stack.Screen name="Privacy"     component={PrivacyScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="About"       component={AboutScreen} />

        {/* Home sub-screens */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="DNA"           component={DNAScreen} />
        <Stack.Screen name="Growth"        component={GrowthScreen} />

        {/* Passport sub-screens */}
        <Stack.Screen name="Goals" component={GoalsScreen} />

        {/* Final */}
        <Stack.Screen name="FinalReport"     component={FinalReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    <NeuronTransition ref={neuronRef} />
    </View>
  );
}
