from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from predict.ml.predict import predict


class EstimativaIAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        area = request.data.get('area')

        if not area:
            return Response({'erro': 'Campo obrigatório: area'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            area = float(area)
            if area <= 0:
                raise ValueError("Área deve ser maior que zero")
        except (ValueError, TypeError) as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = predict(area)
            print(f"📊 Resultado da previsão: {result}")  # Log para depuração
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"❌ Erro na previsão: {str(e)}")  # Log para depuração
            return Response({'erro': f'Erro ao processar previsão: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
