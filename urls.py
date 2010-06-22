from django.conf.urls.defaults import *
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^hs_static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/hd1/hosting/r5/himesama/static/'}),
    (r'^game$', 'himesama.views.game'),
    (r'^editor/(?P<level>.*)$', 'himesama.views.editor'),
    (r'^', 'himesama.views.menu'),
)
