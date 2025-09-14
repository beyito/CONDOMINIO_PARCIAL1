import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CustomBottomNavigation extends StatelessWidget {
  final int currentBottomIndex;
  const CustomBottomNavigation({super.key, required this.currentBottomIndex});
  void onItemTapped(BuildContext context, int index) {
    // Solo existe hasta el index 2 dentro de /home, se puede colocar más opciones según a los BottomNavigationBarItem que añadamos
    switch (index) {
      case 0:
        context.go('/home/0');
        break;
      case 1:
        context.go('/home/1');
        break;
      case 2:
        context.go('/home/2');
        break;

      default:
    }
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      fixedColor: Colors.blueAccent,
      elevation: 0,
      currentIndex: currentBottomIndex,
      onTap: (value) => onItemTapped(context, value),
      items: const [
        // Podemos colocar más o quitar. La cantidad tiene que se el mismo que onItemTapped
        BottomNavigationBarItem(icon: Icon(Icons.home_max), label: 'Noticias'),
        BottomNavigationBarItem(
          icon: Icon(Icons.people_alt_rounded),
          label: 'Control de Visitas',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.favorite_outline),
          label: 'Favoritos',
        ),
      ],
    );
  }
}
