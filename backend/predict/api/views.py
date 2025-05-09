from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from predict.ml.predict import predict


class EstimativaIAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        area = request.data.get('area')
        construction_type = request.data.get('construction_type')
        region = request.data.get('region')

        if not all([area, construction_type, region]):
            return Response({'erro': 'Campos obrigatórios: area, construction_type, region'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            area = float(area)
            if area <= 0:
                raise ValueError("Área deve ser maior que zero")
            if construction_type not in ['residential', 'commercial', 'industrial']:
                raise ValueError("Tipo de construção inválido")
            if region not in ['urban', 'suburban', 'rural']:
                raise ValueError("Região inválida")
        except (ValueError, TypeError) as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = predict(area, construction_type, region)
            print(f"📊 Resultado da previsão: {result}")  # Log para depuração
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"❌ Erro na previsão: {str(e)}")  # Log para depuração
            return Response({'erro': f'Erro ao processar previsão: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
