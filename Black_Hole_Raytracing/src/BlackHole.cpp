// BlackHole.cpp : This file contains the 'main' function. Program execution begins and ends there.
//
#include "FPSCounter.h"
#include "RenderScene.h"

int main(int argc, char* argv[])
{
	RenderScene renderScene{};
	FPSCounter countFPS(3.0);
	while (true)
	{
		renderScene.render();
		countFPS.countFPS();
	}
	return 0;
}
