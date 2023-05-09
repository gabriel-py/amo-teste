from .base import *
DEBUG = True
ALLOWED_HOSTS = ['*']
INSTALLED_APPS += []
MIDDLEWARE += []


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join('db.sqlite3'),
    }
}