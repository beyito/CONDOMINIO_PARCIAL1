from rest_framework.permissions import BasePermission

class IsPersonal(BasePermission):
    """
    Permite acceso solo si el usuario tiene rol 'personal'.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.idRol
            and request.user.idRol.name == 'Personal'
        )

class IsCopropietario(BasePermission):
    """
    Permite acceso solo si el usuario tiene rol 'copropietario'.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.idRol
            and request.user.idRol.name == 'Copropietario'
        )
