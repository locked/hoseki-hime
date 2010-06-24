from django.db import models

from facebookconnect.models import FacebookProfile

class Score(models.Model):
   facebookprofile = models.ForeignKey( FacebookProfile, null=False, blank=False )
   score = models.IntegerField( null=True, blank=True )
   level = models.IntegerField( null=True, blank=True )

