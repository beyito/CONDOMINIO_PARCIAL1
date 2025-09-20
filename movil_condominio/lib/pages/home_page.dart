import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:movil_condominio/shared/custom_appbar.dart';
import 'package:movil_condominio/shared/custom_bottom_navigation.dart';
import 'package:movil_condominio/views/usuario/noticias_view.dart';
import '../views/control_ingreso/control_ingreso_view.dart';
//import '../views/reservas/reservas_view.dart';
//import '../views/areas_comunes/areas_comunes_view.dart';

class HomePage extends StatefulWidget {
  static const name = 'home-screen';
  final int pageIndex;
  const HomePage({super.key, required this.pageIndex});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _rol = '';
  List<Widget> _viewRoutes = [];

  @override
  void initState() {
    super.initState();
    _setupHomePage();
  }

  Future<void> _setupHomePage() async {
    final prefs = await SharedPreferences.getInstance();
    final rol = prefs.getString('rol') ?? '';
    setState(() {
      _rol = rol;

      // Definir las vistas según el rol
      if (_rol == 'Guardia') {
        _viewRoutes = [
          NoticiasView(),
          ControlIngresoView(),
          // placeholder
        ];
      } else if (_rol == 'Copropietario') {
        _viewRoutes = [
          NoticiasView(),
          //ReservasView(),
          //AreasComunesView(),
        ];
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppbar(),
      body: _viewRoutes.isNotEmpty
          ? IndexedStack(index: widget.pageIndex, children: _viewRoutes)
          : const Center(child: CircularProgressIndicator()),
      bottomNavigationBar: _rol.isNotEmpty
          ? CustomBottomNavigation(currentIndex: widget.pageIndex, rol: _rol)
          : null,
    );
  }
}
