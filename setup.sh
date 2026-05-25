#!/bin/bash

# SentientWallet Setup Script
# This script automates the setup process for local development

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    local missing_deps=0

    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node -v) installed"
        else
            print_error "Node.js version must be >= 18.17.0 (found $(node -v))"
            missing_deps=1
        fi
    else
        print_error "Node.js is not installed"
        missing_deps=1
    fi

    # Check npm
    if command_exists npm; then
        print_success "npm $(npm -v) installed"
    else
        print_error "npm is not installed"
        missing_deps=1
    fi

    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        print_success "Python $(python3 --version | cut -d' ' -f2) installed"
    else
        print_error "Python 3 is not installed"
        missing_deps=1
    fi

    # Check pip
    if command_exists pip3; then
        print_success "pip $(pip3 --version | cut -d' ' -f2) installed"
    else
        print_error "pip3 is not installed"
        missing_deps=1
    fi

    # Check PostgreSQL (optional)
    if command_exists psql; then
        print_success "PostgreSQL installed"
    else
        print_warning "PostgreSQL not found - will use Docker or remote database"
    fi

    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker installed"
    else
        print_warning "Docker not found - optional for local development"
    fi

    if [ $missing_deps -ne 0 ]; then
        print_error "Missing required dependencies. Please install them first."
        echo ""
        echo "Install instructions:"
        echo "  Node.js: https://nodejs.org/"
        echo "  Python: https://www.python.org/"
        echo "  PostgreSQL: https://www.postgresql.org/"
        exit 1
    fi

    print_success "All prerequisites met!"
}

# Setup environment files
setup_env_files() {
    print_header "Setting Up Environment Files"

    # Frontend .env
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/.env.example frontend/.env.local
        print_success "Created frontend/.env.local"
        print_warning "Please edit frontend/.env.local with your configuration"
    else
        print_info "frontend/.env.local already exists"
    fi

    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env"
        print_warning "Please edit backend/.env with your API keys"
    else
        print_info "backend/.env already exists"
    fi

    # AI Engine .env
    if [ ! -f "ai-engine/.env" ]; then
        cp ai-engine/.env.example ai-engine/.env 2>/dev/null || true
        if [ -f "ai-engine/.env" ]; then
            print_success "Created ai-engine/.env"
        else
            echo "GEMINI_API_KEY=your_key_here" > ai-engine/.env
            echo "GEMINI_MODEL=gemini-1.5-pro" >> ai-engine/.env
            echo "HOST=0.0.0.0" >> ai-engine/.env
            echo "PORT=8000" >> ai-engine/.env
            echo "DEBUG=true" >> ai-engine/.env
            print_success "Created ai-engine/.env"
        fi
        print_warning "Please edit ai-engine/.env with your Gemini API key"
    else
        print_info "ai-engine/.env already exists"
    fi
}

# Setup Frontend
setup_frontend() {
    print_header "Setting Up Frontend"

    cd frontend

    print_info "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"

    cd ..
}

# Setup Backend
setup_backend() {
    print_header "Setting Up Backend"

    cd backend

    print_info "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"

    print_info "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"

    # Ask about database setup
    echo ""
    read -p "Do you want to run database migrations now? (requires PostgreSQL) [y/N]: " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Running database migrations..."
        npx prisma migrate dev --name init
        print_success "Database migrations completed"
    else
        print_warning "Skipping database migrations. Run 'npm run prisma:migrate' later."
    fi

    cd ..
}

# Setup AI Engine
setup_ai_engine() {
    print_header "Setting Up AI Engine"

    cd ai-engine

    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"

    print_info "Activating virtual environment and installing dependencies..."

    # Activate venv and install
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        source venv/Scripts/activate
    else
        # Unix-like
        source venv/bin/activate
    fi

    pip install --upgrade pip
    pip install -r requirements.txt
    print_success "AI Engine dependencies installed"

    deactivate 2>/dev/null || true

    cd ..
}

# Create logs directories
create_directories() {
    print_header "Creating Required Directories"

    mkdir -p backend/logs
    mkdir -p ai-engine/logs
    print_success "Log directories created"
}

# Display next steps
show_next_steps() {
    print_header "Setup Complete! 🎉"

    echo ""
    echo -e "${GREEN}Next Steps:${NC}"
    echo ""
    echo "1. Configure your environment variables:"
    echo "   - frontend/.env.local"
    echo "   - backend/.env"
    echo "   - ai-engine/.env"
    echo ""
    echo "2. Add your API keys:"
    echo "   - Gemini API Key (required): https://makersuite.google.com/app/apikey"
    echo "   - Alchemy API Key (required): https://dashboard.alchemy.com/"
    echo "   - Tenderly API Key (optional): https://dashboard.tenderly.co/"
    echo ""
    echo "3. Start the services:"
    echo ""
    echo "   ${YELLOW}Using Docker (recommended):${NC}"
    echo "   $ docker-compose up"
    echo ""
    echo "   ${YELLOW}Or manually:${NC}"
    echo ""
    echo "   Terminal 1 - Backend:"
    echo "   $ cd backend && npm run dev"
    echo ""
    echo "   Terminal 2 - AI Engine:"
    echo "   $ cd ai-engine && source venv/bin/activate && uvicorn src.main:app --reload"
    echo ""
    echo "   Terminal 3 - Frontend:"
    echo "   $ cd frontend && npm run dev"
    echo ""
    echo "4. Open your browser:"
    echo "   - Frontend: ${BLUE}http://localhost:3000${NC}"
    echo "   - Backend API: ${BLUE}http://localhost:3001${NC}"
    echo "   - AI Engine: ${BLUE}http://localhost:8000${NC}"
    echo "   - API Docs: ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    echo "5. Read the documentation:"
    echo "   - README.md for detailed instructions"
    echo "   - Check Read.md for project specifications"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo ""
}

# Main setup flow
main() {
    clear
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                        ║${NC}"
    echo -e "${BLUE}║      ${GREEN}SentientWallet Setup${BLUE}              ║${NC}"
    echo -e "${BLUE}║      ${NC}AI-Powered DeFi Management${BLUE}         ║${NC}"
    echo -e "${BLUE}║                                        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    check_prerequisites

    echo ""
    read -p "Continue with setup? [Y/n]: " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Setup cancelled."
        exit 0
    fi

    setup_env_files
    create_directories

    # Ask what to setup
    echo ""
    print_info "What would you like to setup?"
    echo "1) Everything (recommended)"
    echo "2) Frontend only"
    echo "3) Backend only"
    echo "4) AI Engine only"
    echo "5) Custom selection"
    read -p "Enter choice [1-5]: " -n 1 -r choice
    echo ""
    echo ""

    case $choice in
        1)
            setup_frontend
            setup_backend
            setup_ai_engine
            ;;
        2)
            setup_frontend
            ;;
        3)
            setup_backend
            ;;
        4)
            setup_ai_engine
            ;;
        5)
            read -p "Setup Frontend? [y/N]: " -n 1 -r
            echo ""
            [[ $REPLY =~ ^[Yy]$ ]] && setup_frontend

            read -p "Setup Backend? [y/N]: " -n 1 -r
            echo ""
            [[ $REPLY =~ ^[Yy]$ ]] && setup_backend

            read -p "Setup AI Engine? [y/N]: " -n 1 -r
            echo ""
            [[ $REPLY =~ ^[Yy]$ ]] && setup_ai_engine
            ;;
        *)
            print_error "Invalid choice. Running full setup."
            setup_frontend
            setup_backend
            setup_ai_engine
            ;;
    esac

    show_next_steps
}

# Run main function
main
