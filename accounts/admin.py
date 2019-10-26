from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .forms import UserCreationForm, UserChangeForm
from .models import User, Contact


# a inline admin to edit contacts
class ContactInline(admin.StackedInline):
    model = Contact

    list_display = ('first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ()}),
        ('Personal info', {
            'fields': (('user', 'first_name', 'last_name'), 'location', 'contact_pic', 'friends')
        })
    )


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm  # form to change the users on admin
    add_form = UserCreationForm  # form to create users on admin

    inlines = [ContactInline]  # add contact inline admin

    list_display = ('email', 'is_superuser')  # fields shown in the change list
    list_filter = ('is_superuser', 'is_active')  # fields to filter users on admin
    fieldsets = (
        (None, {
            'fields': (('email', 'password'),)
        }),
        ('Permissions', {
            'fields': ('is_superuser', 'is_active')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')
        }),
    )

    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()


admin.site.register(User, UserAdmin)
