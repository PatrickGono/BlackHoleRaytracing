#version 330 core
out vec4 fragColor;

uniform float screenWidth;
uniform float screenHeight;
uniform float time;

const float PHI = 1.6180339887498948482;
const float PI = 3.14159265359;
const int NUM_ITERATIONS = 4;
const int NUM_AVERAGE = 10;
const float MAX_DIST = 100000.0f;
const float AMBIENT_FACTOR = 0.3f;
const float SCATTERING_FACTOR = 0.2f;

vec3 getRayDirection()
{
	float relX = 2.0f * (gl_FragCoord.x / screenWidth - 0.5f);
	float relY = 2.0f * (gl_FragCoord.y / screenWidth - 0.5f);
	float fovFactor = 0.5f;
	return normalize(vec3(fovFactor * relX, fovFactor * relY, 1.0f));
}

struct Intersection
{
	bool isIntersect;
	float dist;
	vec3 intersection;
	vec3 normal;
};

struct Sphere
{
	vec3 center;
	float radius;
	bool isLightSource;
	vec3 color;
};

struct Torus
{
	vec3 center;
	vec3 axis;
	float radiusLarge;
	float radiusSmall;
	bool isLightSource;
	vec3 color;
};

// Random number generator courtesy of Gold Noise ©2015 dcerisano@standard3d.com
float randomFloat(vec3 xyz, float seed)
{
	return fract(tan(distance(xyz * PHI, xyz) * seed) * xyz.x);
}

vec3 randomDirectionSphere(vec3 rayDirection, float seed)
{
	float rand1 = randomFloat(rayDirection, seed);
	float rand2 = randomFloat(rayDirection, seed + 0.05);
	float lambda = acos(2 * rand1 - 1.0f) - 0.5f * PI;
	float phi = 2 * PI * rand2;

	float x = cos(lambda) * cos(phi);
	float y = cos(lambda) * sin(phi);
	float z = sin(phi);

	return vec3(x, y, z);
}

Intersection intersectTorus(vec3 rayOrigin, vec3 rayDirection, Torus torus)
{
	Intersection result = Intersection(false, 0.0f, vec3(0.0f), vec3(0.0f));
	// to do
	vec3 sphereCenterToOrigin = rayOrigin - torus.center;
	return result;
}

Intersection intersectSphere(vec3 rayOrigin, vec3 rayDirection, Sphere sphere)
{
	Intersection result = Intersection(false, 0.0f, vec3(0.0f), vec3(0.0f));

	vec3 sphereCenterToOrigin = rayOrigin - sphere.center;
	float product = dot(rayDirection, sphereCenterToOrigin);
	float discriminant = dot(product, product) - (dot(sphereCenterToOrigin, sphereCenterToOrigin) - sphere.radius * sphere.radius);
	if (discriminant < 0.0f)
	{
		return result;
	}

	float dist = -product - sqrt(discriminant);
	if (dist < 0.001f || dist > MAX_DIST)
	{
		return result;
	}

	result.isIntersect = true;
	result.dist = dist;
	result.intersection = rayOrigin + dist * rayDirection;
	result.normal = normalize(result.intersection - sphere.center);
	return result;
}

void main()
{
	const int NUM_SPHERES = 5;
	Sphere spheres[NUM_SPHERES];
	spheres[0] = Sphere(vec3(2.0f, -1.0f + sin(time), 10.0f), 1.5f, false, vec3(1.0f, 0.0f, 0.0f));
	spheres[1] = Sphere(vec3(-2.0f, -1.5f + 0.5f * cos(time), 10.0f), 1.0f, false, vec3(0.0f, 1.0f, 0.0f));
	spheres[2] = Sphere(vec3(2.0f * cos(2.0f * time), -2.0f, 30.0f), 1.5f, false, vec3(0.0f, 0.0f, 1.0f));
	spheres[3] = Sphere(vec3(2.0f * sin(time), 3.0f, 20.0f), 2.0f, true, vec3(1.0f, 1.0f, 1.0f));
	spheres[4] = Sphere(vec3(10.0f * sin(time), -1000.0f, 0.0f), 996.5f, false, vec3(0.4f, 0.45f, 0.7f));

	vec3 finalColor = vec3(0.0f);

	for (int rayIndex = 0; rayIndex < NUM_AVERAGE; rayIndex++)
	{
		vec3 rayDirection = getRayDirection();
		vec3 rayOrigin = vec3(0.0f, 0.0f, 0.0f);
		vec3 rayColor = vec3(0.0f, 0.0f, 0.0f);
		float absorptionFactor = 0.9f;
	
		for (int i = 0; i < NUM_ITERATIONS; i++)
		{
			Intersection closestIntersection = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f));
			Sphere closestSphere;
			for (int sphereIndex = 0; sphereIndex < NUM_SPHERES; sphereIndex++)
			{
				Intersection intersection = intersectSphere(rayOrigin, rayDirection, spheres[sphereIndex]);
				if (!intersection.isIntersect)
				{
					continue;
				}
	
				if (closestIntersection.dist > intersection.dist)
				{
					closestIntersection = intersection;
					closestSphere = spheres[sphereIndex];
				}
			}
	
			if (!closestIntersection.isIntersect)
			{
				//rayColor = absorptionFactor * vec3(0.7f, 0.85f, 1.0f) * max(0.0f, dot(vec3(0.0, 1.0, 0.0), rayDirection));
				break;
			}
	
			rayColor += AMBIENT_FACTOR * absorptionFactor * closestSphere.color;
	
			if (closestSphere.isLightSource)
			{
				rayColor = absorptionFactor * closestSphere.color;
				break;
			}
			
			absorptionFactor *= 0.8f;
			rayOrigin = closestIntersection.intersection;
			rayDirection = normalize((1.0f - SCATTERING_FACTOR) * reflect(rayDirection, -closestIntersection.normal) + SCATTERING_FACTOR * randomDirectionSphere(gl_FragCoord.xyz, fract(time * rayIndex))); 
		}

		finalColor += rayColor;
	}
	finalColor = finalColor / NUM_AVERAGE;
	fragColor = vec4(finalColor, 1.0f);
}
