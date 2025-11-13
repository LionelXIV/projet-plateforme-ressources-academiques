from django.contrib import admin
from .models import Course, Document

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'published_at', 'author')
    search_fields = ('title', 'instructor')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'doc_type', 'size')
    search_fields = ('name',)