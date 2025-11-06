#!/bin/bash
# Script to migrate remaining screens from src/screens to app/
# Run this after reviewing the mappings

echo "=== Screen Migration Script ==="
echo "This script will migrate remaining screens to Expo Router"
echo ""

# Function to convert a screen file
convert_screen() {
    local src_file="$1"
    local dest_file="$2"
    local screen_name="$3"

    echo "Converting: $screen_name"
    echo "  From: $src_file"
    echo "  To:   $dest_file"

    # Create destination directory if needed
    mkdir -p "$(dirname "$dest_file")"

    # Convert the file
    sed \
        -e "s|from '@react-navigation/native'|from 'expo-router'|g" \
        -e "s|import { useNavigation, useRoute }|import { useRouter, useLocalSearchParams }|g" \
        -e "s|import { useNavigation }|import { useRouter }|g" \
        -e "s|import { useRoute }|import { useLocalSearchParams }|g" \
        -e "s|const navigation = useNavigation()|const router = useRouter()|g" \
        -e "s|const route = useRoute()|const params = useLocalSearchParams()|g" \
        -e "s|navigation\.goBack()|router.back()|g" \
        -e "s|navigation\.navigate|router.push|g" \
        -e "s|route\.params|params|g" \
        -e "s|from '../../store/|from '../../../src/store/|g" \
        -e "s|from '../../components/|from '../../../src/components/|g" \
        -e "s|from '../../services/|from '../../../src/services/|g" \
        -e "s|from '../../types/|from '../../../src/types/|g" \
        -e "s|from '../../hooks/|from '../../../src/hooks/|g" \
        -e "s|from '../../utils/|from '../../../src/utils/|g" \
        -e "s|from '../store/|from '../../src/store/|g" \
        -e "s|from '../components/|from '../../src/components/|g" \
        -e "s|from '../services/|from '../../src/services/|g" \
        -e "s|from '../types/|from '../../src/types/|g" \
        -e "s|from '../hooks/|from '../../src/hooks/|g" \
        -e "s|from '../utils/|from '../../src/utils/|g" \
        "$src_file" > "$dest_file"

    echo "  ✓ Converted"
    echo ""
}

# Messages/Conversation Screens
echo "=== Phase 1: Messages Screens ==="
# ConversationScreen - Main chat interface
# Note: Needs manual review for realtime subscriptions
convert_screen \
    "src/screens/ConversationScreen.tsx" \
    "app/(tabs)/messages/[id].tsx" \
    "ConversationScreen"

# Profile Screens
echo "=== Phase 2: Profile Screens ==="
convert_screen \
    "src/screens/profile/EditProfileScreen.tsx" \
    "app/(tabs)/profile/edit.tsx" \
    "EditProfileScreen"

convert_screen \
    "src/screens/profile/ViewProfileScreen.tsx" \
    "app/(tabs)/profile/view.tsx" \
    "ViewProfileScreen"

# Sobriety Screens
echo "=== Phase 3: Sobriety Screens ==="
convert_screen \
    "src/screens/sobriety/LogRelapseScreen.tsx" \
    "app/(tabs)/sobriety/log-relapse.tsx" \
    "LogRelapseScreen"

convert_screen \
    "src/screens/sobriety/RelapseHistoryScreen.tsx" \
    "app/(tabs)/sobriety/history.tsx" \
    "RelapseHistoryScreen"

convert_screen \
    "src/screens/sobriety/SetSobrietyDateScreen.tsx" \
    "app/(tabs)/sobriety/set-date.tsx" \
    "SetSobrietyDateScreen"

# Step Work Screens
echo "=== Phase 4: Step Work Screens ==="
convert_screen \
    "src/screens/StepListScreen.tsx" \
    "app/(tabs)/steps/index.tsx" \
    "StepListScreen"

convert_screen \
    "src/screens/StepWorkScreen.tsx" \
    "app/(tabs)/steps/work/[id].tsx" \
    "StepWorkScreen"

convert_screen \
    "src/screens/StepWorkHistoryScreen.tsx" \
    "app/(tabs)/steps/history.tsx" \
    "StepWorkHistoryScreen"

# Check-In Screens
echo "=== Phase 5: Check-In Screens ==="
convert_screen \
    "src/screens/CheckInResponseScreen.tsx" \
    "app/(tabs)/check-ins/response.tsx" \
    "CheckInResponseScreen"

convert_screen \
    "src/screens/CheckInSchedulingScreen.tsx" \
    "app/(tabs)/check-ins/schedule.tsx" \
    "CheckInSchedulingScreen"

# Settings and Review Screens
echo "=== Phase 6: Settings & Review Screens ==="
convert_screen \
    "src/screens/SponsorReviewScreen.tsx" \
    "app/(tabs)/reviews/sponsor.tsx" \
    "SponsorReviewScreen"

convert_screen \
    "src/screens/NotificationSettingsScreen.tsx" \
    "app/(tabs)/settings/notifications.tsx" \
    "NotificationSettingsScreen"

convert_screen \
    "src/screens/settings/ThemeSettingsScreen.tsx" \
    "app/(tabs)/settings/theme.tsx" \
    "ThemeSettingsScreen"

echo "=== Migration Complete ==="
echo ""
echo "Next Steps:"
echo "1. Review the migrated files for any manual fixes needed"
echo "2. Check for complex navigation patterns that need adjustment"
echo "3. Test each screen to ensure routing works correctly"
echo "4. Run: pnpm lint:fix && pnpm typecheck"
echo "5. Delete src/screens/ directory when confirmed working"
echo ""
