import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CustomBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final String rol;
  const CustomBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.rol,
  });

  void onItemTapped(BuildContext context, int index) {
    context.go('/home/$index'); // 👈 así nunca sales del HomePage
  }

  @override
  Widget build(BuildContext context) {
    List<BottomNavigationBarItem> items = [];
    if (rol == 'Guardia') {
      items = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Noticias Condominio',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.login),
          label: 'Control ingreso',
        ),
      ];
    } else if (rol == 'Copropietario') {
      items = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Noticias Condominio',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.book), label: 'Reservas'),
        BottomNavigationBarItem(icon: Icon(Icons.apartment), label: 'Áreas'),
      ];
    }

    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (index) => onItemTapped(context, index),
      items: items,
    );
  }
}
