from django.conf.urls.defaults import *
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^hs_static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/hd1/hosting/r5/himesama/static/'}),
    (r'^editor/(?P<level>[0-9]*)$', 'himesama.views.editor'),
    (r'^level/(?P<level>[0-9]*)/(?P<action>[a-z]*)$', 'himesama.views.level'),
    (r'^score/(?P<score>[0-9]*)/(?P<level>[0-9]*)$', 'himesama.views.score'),
    (r'^scores$', 'himesama.views.scores'),
    (r'^game$', 'himesama.views.game'),
    (r'^', 'himesama.views.menu'),
)
