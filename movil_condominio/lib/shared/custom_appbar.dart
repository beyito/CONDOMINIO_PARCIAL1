import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CustomAppbar extends StatefulWidget implements PreferredSizeWidget {
  const CustomAppbar({super.key});

  @override
  State<CustomAppbar> createState() => _CustomAppbarState();

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class _CustomAppbarState extends State<CustomAppbar> {
  String? rolUsuario;

  @override
  void initState() {
    super.initState();
    _cargarRol();
  }

  Future<void> _cargarRol() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      rolUsuario = prefs.getString('rol'); // 👈 Aquí guardaste el rol al login
    });
  }

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (context.mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: SizedBox(
          width: double.infinity,
          child: Row(
            children: [
              const SizedBox(width: 3),
              const Text('Mi Condominio'),
              const Spacer(),
              PopupMenuButton<String>(
                icon: const Icon(Icons.person, size: 28),
                onSelected: (value) async {
                  if (value == 'perfil') {
                    context.go('/home/0/perfil');
                  } else if (value == 'personas') {
                    context.go('/home/0/personas');
                  } else if (value == 'logout') {
                    await _logout(context);
                  }
                },
                itemBuilder: (context) {
                  final items = <PopupMenuEntry<String>>[
                    const PopupMenuItem(
                      value: 'perfil',
                      child: ListTile(
                        leading: Icon(Icons.account_circle),
                        title: Text('Mi perfil'),
                      ),
                    ),
                  ];

                  // 👇 Solo mostrar si es copropietario
                  if (rolUsuario == 'Copropietario') {
                    items.add(
                      const PopupMenuItem(
                        value: 'personas',
                        child: ListTile(
                          leading: Icon(Icons.group),
                          title: Text('Mis personas'),
                        ),
                      ),
                    );
                  }

                  items.add(
                    const PopupMenuItem(
                      value: 'logout',
                      child: ListTile(
                        leading: Icon(Icons.logout),
                        title: Text('Cerrar sesión'),
                      ),
                    ),
                  );

                  return items;
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
