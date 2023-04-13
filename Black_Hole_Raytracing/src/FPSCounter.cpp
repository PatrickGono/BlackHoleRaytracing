#include "FPSCounter.h"

FPSCounter::FPSCounter(double periodSeconds) : m_period(periodSeconds)
{
	m_previousTime = glfwGetTime();
	m_currentTime = glfwGetTime();
}

void FPSCounter::countFPS()
{
	m_currentTime = glfwGetTime();
	m_nFrames++;

	if (m_currentTime - m_previousTime >= m_period)
	{
		// print FPS and miliseconds per frame
		std::cout << m_nFrames / m_period << " / " << 1000.0 / m_nFrames << "\n";
		m_previousTime = m_currentTime;
		m_nFrames = 0;
	}
}
