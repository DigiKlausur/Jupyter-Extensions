# -*- coding: utf-8 -*-


from setuptools import setup, find_packages


with open('README.rst') as f:
    readme = f.read()

with open('LICENSE') as f:
    license = f.read()

setup(
    name='taskmanager',
    version='0.1.0',
    description='Task Manager',
    long_description=readme,
    author='Tim Metzler',
    author_email='tim.metzler@h-brs.de',
    license=license,
    packages=find_packages(exclude=('tests', 'docs')),
    package_data={}
)
