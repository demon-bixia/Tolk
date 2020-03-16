from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie


# web interface
# renders index.html in templates
@method_decorator(ensure_csrf_cookie, name="dispatch")
class Interface(View):
    template_name = 'index.html'
    context = {}

    def get(self, request):
        return render(request, self.template_name, self.context)
