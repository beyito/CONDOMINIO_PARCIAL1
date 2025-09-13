import 'package:flutter/material.dart';
import 'package:movil_condominio/functions/Funtions.dart';
import 'package:movil_condominio/models/noticia_model.dart';
import 'package:movil_condominio/services/noticias_service.dart';
import 'package:movil_condominio/widgets/noticia_widget.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  HomeViewState createState() => HomeViewState();
}

class HomeViewState extends State<HomeView> {
  final NoticiasService noticiasService = NoticiasService();
  late Future<List<NoticiaModel>> noticias;

  @override
  void initState() {
    super.initState();
    noticias = noticiasService.mostrarComunicados();
  }

  @override
  Widget build(BuildContext context) {
    //final fechaActual = Functions.fechaActual();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Noticias del Condominio',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.green[700],
      ),
      body: FutureBuilder<List<NoticiaModel>>(
        future: noticias,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final noticias = snapshot.data ?? [];
          final noticiasVigentes = noticias; //.where((noticia) {
          //   return noticia.expiraEn != null &&
          //       noticia.expiraEn!.compareTo(fechaActual) >= 0;
          // }).toList();

          // if (noticiasVigentes.isEmpty) {
          //   return const Center(child: Text('No hay noticias vigentes.'));
          // }
          return PageView.builder(
            scrollDirection: Axis.vertical,
            itemCount: noticiasVigentes.length,
            itemBuilder: (context, index) {
              return NoticiaWidget(noticia: noticiasVigentes[index]);
            },
          );
        },
      ),
    );
  }
}
