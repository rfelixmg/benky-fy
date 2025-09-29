from setuptools import setup, find_packages

setup(
    name="benky-fy",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        'Flask==3.0.0',
        'Flask-Dance==7.0.0',
        'Flask-Session==0.5.0',
        'requests==2.31.0',
        'python-dotenv==1.0.0',
        'gunicorn==21.2.0',
        'oauthlib==3.2.2',
        'itsdangerous==2.1.2',
        'psutil==5.9.8',
        'pytest==8.0.0',
        'pytest-cov==4.1.0'
    ],
)
