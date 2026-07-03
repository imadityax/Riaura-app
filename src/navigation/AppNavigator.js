import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import MindfulnessAssessScreen from '../screens/assess/MindfulnessAssessScreen';
import MindfulnessReportScreen from '../screens/assess/MindfulnessReportScreen';

// Phase 1
import RegistrationScreen from '../screens/phase1/RegistrationScreen';
import ConsentScreen from '../screens/phase1/ConsentScreen';

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

// Results
import HighPerformanceScreen from '../screens/results/HighPerformanceScreen';
import DevelopmentPathwayScreen from '../screens/results/DevelopmentPathwayScreen';

// Phase 4
import Phase4BookingScreen from '../screens/phase4/Phase4BookingScreen';
import Phase4InterviewScreen from '../screens/phase4/Phase4InterviewScreen';

// Profile sub-screens
import SettingsScreen from '../screens/profile/SettingsScreen';
import PrivacyScreen  from '../screens/profile/PrivacyScreen';

// Final
import FinalReportScreen from '../screens/final/FinalReportScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerShown: false,
  gestureEnabled: false,
  cardStyle: { backgroundColor: '#F8F5F0' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
        <Stack.Screen name="Splash"        component={SplashScreen} />
        <Stack.Screen name="Login"         component={LoginScreen} />
        <Stack.Screen name="Main"          component={MainTabNavigator} />

        {/* Assessment */}
        <Stack.Screen name="MindfulnessAssess"  component={MindfulnessAssessScreen} />
        <Stack.Screen name="MindfulnessReport"  component={MindfulnessReportScreen} />

        {/* Registration flow */}
        <Stack.Screen name="Registration"  component={RegistrationScreen} />
        <Stack.Screen name="Consent"       component={ConsentScreen} />

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

        {/* Results */}
        <Stack.Screen name="HighPerformance"    component={HighPerformanceScreen} />
        <Stack.Screen name="DevelopmentPathway" component={DevelopmentPathwayScreen} />

        {/* Phase 4 */}
        <Stack.Screen name="Phase4Booking"   component={Phase4BookingScreen} />
        <Stack.Screen name="Phase4Interview" component={Phase4InterviewScreen} />

        {/* Profile sub-screens */}
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Privacy"  component={PrivacyScreen} />

        {/* Final */}
        <Stack.Screen name="FinalReport"     component={FinalReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
