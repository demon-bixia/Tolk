from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie


# application root
@method_decorator(ensure_csrf_cookie, name="dispatch")
class Index(View):
    template_name = 'index.html'
    context = {}

    def get(self, request):
        if request.user.is_authenticated:
            self.context['user_authenticated'] = 'true'
        else:
            self.context['user_authenticated'] = 'false'

        return render(request, self.template_name, self.context)
