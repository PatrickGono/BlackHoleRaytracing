#pragma once
#include <iostream>
#include <GL/glew.h>
#include <GLFW/glfw3.h>

class FPSCounter
{
private:
	double m_currentTime{0.0};
	double m_previousTime{0.0};
	double m_period{1.0};
	int    m_nFrames{0};

public:
	FPSCounter(double periodSeconds = 1.0);
	void countFPS();
};

