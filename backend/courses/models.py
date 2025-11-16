from django.db import models
from django.conf import settings

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True)
    full_description = models.TextField(blank=True)
    instructor = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=100, blank=True)
    level = models.CharField(max_length=100, blank=True)
    image = models.URLField(blank=True)
    published_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def to_dict(self):
        return {
            "id": self.pk,
            "title": self.title,
            "description": self.description,
            "fullDescription": self.full_description,
            "instructor": self.instructor,
            "category": self.category,
            "level": self.level,
            "image": self.image,
            "publishedAt": self.published_at.isoformat(),
        }

    def __str__(self):
        return self.title

class Document(models.Model):
    course = models.ForeignKey(Course, related_name="documents", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=64, blank=True)
    size = models.CharField(max_length=64, blank=True)
    url = models.URLField(blank=True)

    def to_dict(self):
        return {
            "id": self.pk,
            "name": self.name,
            "type": self.doc_type,
            "size": self.size,
            "url": self.url,
        }

    def __str__(self):
        return f"{self.name} ({self.course_id})"
