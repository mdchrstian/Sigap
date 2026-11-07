from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "full_name", "role")
        read_only_fields = ("id", "email", "role")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "role", "password")
        read_only_fields = ("id", "role")
        extra_kwargs = {"email": {"validators": []}}

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email sudah terdaftar.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, data):
        return User.objects.create_user(
            email=data["email"], password=data["password"],
            full_name=data.get("full_name", ""), role=User.Role.PUBLIC,
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
