#!/bin/bash
# Quickstart Validation Script (T147)
# Validates that the quickstart.md guide is accurate and working

set -e  # Exit on error

echo "🔍 Validating Quickstart Guide..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 found${NC}"
        $1 --version | head -1
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# Section 1: Prerequisites
echo "📋 Section 1: Prerequisites"
echo "----------------------------"

check_command node
check_command pnpm
check_command npx

echo ""

# Section 2: Project Setup
echo "📦 Section 2: Project Setup"
echo "----------------------------"

check_directory node_modules
check_directory src
check_directory app
check_directory supabase

echo ""

# Section 3: Environment Configuration
echo "🔧 Section 3: Environment Configuration"
echo "----------------------------------------"

if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"

    # Check for required variables
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        echo -e "${GREEN}✅ EXPO_PUBLIC_SUPABASE_URL configured${NC}"
    else
        echo -e "${YELLOW}⚠️  EXPO_PUBLIC_SUPABASE_URL not set${NC}"
    fi

    if grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}✅ EXPO_PUBLIC_SUPABASE_ANON_KEY configured${NC}"
    else
        echo -e "${YELLOW}⚠️  EXPO_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found (optional for testing)${NC}"
fi

echo ""

# Section 4: Database Setup
echo "🗄️  Section 4: Database Setup"
echo "-----------------------------"

if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI installed${NC}"

    # Check if migrations exist
    if [ -d supabase/migrations ]; then
        MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
        echo -e "${GREEN}✅ $MIGRATION_COUNT migration(s) found${NC}"
    else
        echo -e "${YELLOW}⚠️  No migrations directory${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not installed (optional)${NC}"
fi

echo ""

# Section 5: Testing Commands
echo "🧪 Section 5: Testing Commands"
echo "-------------------------------"

echo "Running: pnpm typecheck"
if pnpm typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript validation passed${NC}"
else
    echo -e "${RED}❌ TypeScript validation failed${NC}"
    FAILURES=$((FAILURES + 1))
fi

echo "Running: pnpm lint"
if pnpm lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠️  Linting issues found (run 'pnpm lint:fix')${NC}"
fi

echo "Running: pnpm test --passWithNoTests"
if pnpm test --passWithNoTests > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    FAILURES=$((FAILURES + 1))
fi

echo ""

# Section 6: Project Structure
echo "📁 Section 6: Project Structure"
echo "--------------------------------"

# Check key directories from quickstart
check_directory app
check_directory "app/(tabs)"
check_directory "app/(auth)"
check_directory "app/(onboarding)"
check_directory src/components
check_directory src/store
check_directory src/services
check_directory __tests__

echo ""

# Section 7: Package Scripts
echo "📜 Section 7: Package Scripts"
echo "------------------------------"

SCRIPTS=("start" "ios" "android" "web" "test" "typecheck" "lint" "lint:fix")

for script in "${SCRIPTS[@]}"; do
    if pnpm run --silent 2>&1 | grep -q "^  $script"; then
        echo -e "${GREEN}✅ pnpm $script available${NC}"
    else
        echo -e "${RED}❌ pnpm $script not found${NC}"
        FAILURES=$((FAILURES + 1))
    fi
done

echo ""

# Section 8: Documentation Files
echo "📚 Section 8: Documentation"
echo "----------------------------"

check_file "specs/002-app-screens/quickstart.md"
check_file "specs/002-app-screens/spec.md"
check_file "specs/002-app-screens/plan.md"
check_file "specs/002-app-screens/data-model.md"
check_file "specs/002-app-screens/research.md"
check_file "specs/002-app-screens/tasks.md"
check_file "CLAUDE.md"

echo ""

# Summary
echo "=================================="
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}🎉 All validations passed!${NC}"
    echo ""
    echo "The quickstart.md guide is accurate and the environment is ready."
    echo ""
    echo "Next steps:"
    echo "  1. Run 'pnpm start' to start the Expo development server"
    echo "  2. Choose platform: Press 'i' (iOS), 'a' (Android), or 'w' (Web)"
    echo "  3. Read specs/002-app-screens/spec.md for feature details"
    exit 0
else
    echo -e "${RED}⚠️  $FAILURES validation(s) failed${NC}"
    echo ""
    echo "Please review the errors above and:"
    echo "  1. Install missing prerequisites"
    echo "  2. Run 'pnpm install' if dependencies are missing"
    echo "  3. Create .env from .env.example if needed"
    echo "  4. Fix TypeScript/linting errors"
    echo ""
    echo "See quickstart.md for detailed setup instructions."
    exit 1
fi
