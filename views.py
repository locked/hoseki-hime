from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
from django.utils import html, translation, simplejson
import os,sys

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


def menu(request):
    template = "hs_menu.html"
    return render_to_response(template, {}, context_instance=RequestContext(request))

def editor(request, level=0):
    template = "hs_game.html"
    game_globals['gamemode'] = 'editor'
    game_globals['level'] = int(level)
    return render_to_response(template, game_globals, context_instance=RequestContext(request))

def game(request):
    template = "hs_game.html"
    game_globals['gamemode'] = 'game'
    return render_to_response(template, game_globals, context_instance=RequestContext(request))

