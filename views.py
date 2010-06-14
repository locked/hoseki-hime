from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext


def menu(request):
    template = "hs_menu.html"
    data = {}
    return render_to_response(template, data, context_instance=RequestContext(request))

def game(request):
    template = "hs_game.html"
    data = {}
    return render_to_response(template, data, context_instance=RequestContext(request))
