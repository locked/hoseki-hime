from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext


def menu(request):
    template = "hs_menu.html"
    return render_to_response(template, {}, context_instance=RequestContext(request))

def editor(request, level=0):
    template = "hs_game.html"
    return render_to_response(template, {'gamemode':'editor'}, context_instance=RequestContext(request))

def game(request):
    template = "hs_game.html"
    return render_to_response(template, {}, context_instance=RequestContext(request))
