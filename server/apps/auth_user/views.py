from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import redirect
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth import authenticate, get_user_model

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer
from memoria.settings import DEFAULT_FROM_EMAIL


class RegisterView(APIView):
    # permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate email confirmation token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verification_link = f"http://localhost:8000/api/auth/activate/{uid}/{token}/"

            # Send email
            subject = "Xác nhận đăng ký tài khoản - Memoria"
            html_message = render_to_string("auth_user/confirm_email.html", {"user": user, "activation_link": verification_link})
            plain_message = strip_tags(html_message)  # Fallback for non-HTML email clients
            recipient_list = [user.email]

            send_mail(subject, plain_message, DEFAULT_FROM_EMAIL, recipient_list, html_message=html_message)

            return Response({"message": "Please check your email to confirm registration"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateAccountView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return redirect("http://localhost:3000/verification-failed/")  # Redirect to failure page

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect(f"http://localhost:3000/account-success/")  # Redirect to success page
        else:
            return redirect("http://localhost:3000/verification-failed/")  # Redirect to failure page
        

class SignInView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "message": "Log in successfully!",
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"error": "Neither username or password is right!"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Blacklist the token (only if token blacklisting is enabled)
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RequestPasswordResetView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Email không tồn tại trong hệ thống!"}, status=status.HTTP_404_NOT_FOUND)

        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:3000/reset-password/{uidb64}/{token}/"

        # Send email
        subject = "Đặt lại mật khẩu cho tài khoản - Memoria"
        html_message = render_to_string("auth_user/reset_password_email.html", {"user": user, "reset_link": reset_link})
        plain_message = strip_tags(html_message)  # Fallback for non-HTML email clients
        recipient_list = [user.email]

        send_mail(subject, plain_message, DEFAULT_FROM_EMAIL, recipient_list, html_message=html_message, fail_silently=False)

        return Response({"message": "Email đặt lại mật khẩu đã được gửi!"}, status=status.HTTP_200_OK)
    
class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Liên kết đặt lại mật khẩu không hợp lệ!"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return redirect("http://localhost:3000/reset-password/failed")  # Redirect to failure page
            # return Response({"error": "Token không hợp lệ hoặc đã hết hạn!"}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("password")
        user.set_password(new_password)
        user.save()

        return Response({"message": "Mật khẩu đã được đặt lại thành công!"}, status=status.HTTP_200_OK)