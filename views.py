from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
from django.utils import html, translation, simplejson
import os,sys

from facebookconnect.models import FacebookProfile
from himesama.models import Score

cur_path = sys.path[0]
level_filename = cur_path+"/r5/himesama"+"/world.levels"
x_coins = 17
y_coins = 35
game_globals = { 'level': 0, 'x_coins': x_coins, 'y_coins': y_coins }

max_elements_per_level = x_coins*y_coins
level_size = max_elements_per_level + 100

def level_save( level, elements ):
    elts = elements.split( "," )
    try:
        f = open( level_filename, "r+" )
    except:
        f = open( level_filename, "w" )
    f.seek( int(level)*level_size )
    for e in elts:
        f.write( chr( int( e ) ) )
    f.close()

def dec2hex(n):
    return "%X" % n

def hex2dec(s):
    """return the integer value of a hexadecimal string s"""
    return int(s, 16)

def level_load( level ):
    elements = []
    import codecs
    f = codecs.open( level_filename, encoding='ascii' )
    #f = open( level_filename, "r" )
    f.seek( int(level)*level_size )
    i = 0
    while i<max_elements_per_level:
        i += 1
        try:
            e = ord( f.read( 1 ) )
            #if e=='': e = 0
        except:
            e = 0
        elements.append( int( e ) )
    f.close()
    return elements

def level(request, level, action):
    if action=='save':
        elements = request.GET['elements']
        level_save( level, elements )
    elif action=='load':
        elements = level_load( level )
    msg = { 'level': int(level), 'elements':elements, 'result': 'OK' }
    return HttpResponse( simplejson.dumps( msg ) )

def scores(request):
    ss = Score.objects.all().order_by('score')
    scores = []
    for s in ss:
        scores.append( "<td>%s</td><td>%s</td><td>%s</td>" % (s.facebookprofile.user.username, str(s.score), str(s.level) ) )
        #scores.append( "user:"+s.facebookprofile.user.username+" score:"+str(s.score)+" level:"+str(s.level) )
    return HttpResponse( simplejson.dumps( scores ) )

def score(request, score, level):
    score = int(score)
    level = int(level)
    if request.user.is_authenticated():
        fbp = FacebookProfile.objects.get( user=request.user )
        s, created = Score.objects.get_or_create( facebookprofile=fbp )
        if (s.score is None) or (s.score<score):
            s.score = score
        if (s.level is None) or (s.level<level):
            s.level = level
        s.save()
    return HttpResponse( "OK %d %d " % (s.score, score) )

def menu(request):
    template = "hs_menu.html"
    return render_to_response(template, {}, context_instance=RequestContext(request))

def editor(request, level=0):
    template = "hs_game.html"
    game_globals['gamemode'] = 'editor'
    s = Score( score=0, level=level )
    game_globals['score'] = s
    return render_to_response(template, game_globals, context_instance=RequestContext(request))

def game(request):
    template = "hs_game.html"
    game_globals['gamemode'] = 'game'
    if request.user.is_authenticated():
        try:
            fbp = FacebookProfile.objects.get( user=request.user )
            s, created = Score.objects.get_or_create( facebookprofile=fbp )
            if s.score is None: s.score = 0
            if s.level is None: s.level = 0
            s.save()
            game_globals['fbp'] = fbp
        except:
            s = Score( score=0, level=0 )
    else:
        s = Score( score=0, level=0 )
    game_globals['score'] = s
    return render_to_response(template, game_globals, context_instance=RequestContext(request))

