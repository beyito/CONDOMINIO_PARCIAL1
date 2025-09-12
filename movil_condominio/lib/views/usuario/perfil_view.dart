import 'package:flutter/material.dart';

class PerfilView extends StatelessWidget {
  static const name = 'perfil-screen';
  const PerfilView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: (Column(
        children: [Text("Mi vista perfil de usuario")],
      )),
    );
  }
}
