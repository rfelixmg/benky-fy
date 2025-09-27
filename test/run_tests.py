#!/usr/bin/env python3
"""
Test runner script for Benky-Fy test suite.

This script provides an easy way to run all tests or specific test modules.
"""

import sys
import os
import subprocess
import argparse

# Add the test directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def run_tests(test_pattern=None, verbose=False, coverage=False):
    """Run tests with specified options."""
    cmd = [sys.executable, '-m', 'pytest']
    
    if verbose:
        cmd.append('-v')
    
    if coverage:
        cmd.extend(['--cov=app', '--cov-report=html', '--cov-report=term'])
    
    if test_pattern:
        cmd.append(test_pattern)
    else:
        cmd.append('test/')
    
    print(f"Running command: {' '.join(cmd)}")
    return subprocess.run(cmd)

def main():
    """Main function to handle command line arguments."""
    parser = argparse.ArgumentParser(description='Run Benky-Fy tests')
    parser.add_argument('--pattern', '-p', help='Test pattern to run (e.g., test_main_routes.py)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--coverage', '-c', action='store_true', help='Run with coverage')
    parser.add_argument('--quick', '-q', action='store_true', help='Run quick tests only')
    
    args = parser.parse_args()
    
    if args.quick:
        # Run only essential tests
        test_pattern = 'test/test_main_routes.py::TestMainRoutes::test_home_with_test_auth_success'
    else:
        test_pattern = args.pattern
    
    result = run_tests(test_pattern, args.verbose, args.coverage)
    sys.exit(result.returncode)

if __name__ == '__main__':
    main()
